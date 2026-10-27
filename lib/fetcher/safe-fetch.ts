import { validateUrlForSsrf } from './ssrf';

export interface SafeFetchOptions {
  userAgent?: string;
  timeoutMs?: number;
  maxBytes?: number;
  maxRedirects?: number;
  method?: 'GET' | 'HEAD';
  headers?: Record<string, string>;
}

export interface SafeFetchResult {
  ok: boolean;
  status: number;
  finalUrl: string;
  redirectChain: string[];
  headers: Record<string, string>;
  body: string;
  contentLength: number;
  contentType: string;
  timingMs: number;
  error?: string;
  errorCode?: string;
}

export const DEFAULT_USER_AGENT =
  'AISEOAuditBot/1.0 (+https://citeify.app; AI-readiness audit tool; contact@citeify.app)';

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB size cap
const TIMEOUT_MS = 8000; // 8 seconds per request
const MAX_REDIRECTS = 5;

/**
 * Executes a security-hardened HTTP request with SSRF validation, redirect tracking,
 * size capping, and strict timeouts.
 */
export async function safeFetch(
  targetUrl: string,
  options: SafeFetchOptions = {}
): Promise<SafeFetchResult> {
  const timeoutMs = options.timeoutMs ?? TIMEOUT_MS;
  const maxBytes = options.maxBytes ?? MAX_BYTES;
  const maxRedirects = options.maxRedirects ?? MAX_REDIRECTS;
  const userAgent = options.userAgent ?? DEFAULT_USER_AGENT;
  const method = options.method ?? 'GET';

  let currentUrl = targetUrl;
  const redirectChain: string[] = [targetUrl];
  let redirectsCount = 0;
  const startTime = Date.now();

  while (redirectsCount <= maxRedirects) {
    // 1. Validate target URL against SSRF rules before every hop
    const ssrfCheck = await validateUrlForSsrf(currentUrl);
    if (!ssrfCheck.isValid) {
      return {
        ok: false,
        status: 0,
        finalUrl: currentUrl,
        redirectChain,
        headers: {},
        body: '',
        contentLength: 0,
        contentType: '',
        timingMs: Date.now() - startTime,
        error: ssrfCheck.error || 'Security check failed.',
        errorCode: ssrfCheck.errorCode || 'BLOCKED_TARGET',
      };
    }

    currentUrl = ssrfCheck.normalizedUrl;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(currentUrl, {
        method,
        redirect: 'manual', // Manually handle redirects to enforce SSRF validation at each step
        headers: {
          'User-Agent': userAgent,
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.5',
          'Accept-Language': 'en-US,en;q=0.9',
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle Redirects (301, 302, 303, 307, 308)
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        if (!location) {
          return {
            ok: false,
            status: response.status,
            finalUrl: currentUrl,
            redirectChain,
            headers: Object.fromEntries(response.headers.entries()),
            body: '',
            contentLength: 0,
            contentType: response.headers.get('content-type') || '',
            timingMs: Date.now() - startTime,
            error: 'Redirect location header missing.',
            errorCode: 'FETCH_FAILED',
          };
        }

        redirectsCount++;
        if (redirectsCount > maxRedirects) {
          return {
            ok: false,
            status: response.status,
            finalUrl: currentUrl,
            redirectChain,
            headers: Object.fromEntries(response.headers.entries()),
            body: '',
            contentLength: 0,
            contentType: response.headers.get('content-type') || '',
            timingMs: Date.now() - startTime,
            error: `Exceeded maximum redirect limit of ${maxRedirects}.`,
            errorCode: 'TOO_MANY_REDIRECTS',
          };
        }

        // Resolve relative redirect against current URL
        try {
          const nextUrl = new URL(location, currentUrl).toString();
          redirectChain.push(nextUrl);
          currentUrl = nextUrl;
          continue; // Loop to next hop
        } catch {
          return {
            ok: false,
            status: response.status,
            finalUrl: currentUrl,
            redirectChain,
            headers: Object.fromEntries(response.headers.entries()),
            body: '',
            contentLength: 0,
            contentType: '',
            timingMs: Date.now() - startTime,
            error: 'Invalid redirect target URL.',
            errorCode: 'INVALID_URL',
          };
        }
      }

      // Read response body with 2 MB cap
      const contentType = response.headers.get('content-type') || '';
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((val, key) => {
        responseHeaders[key.toLowerCase()] = val;
      });

      if (method === 'HEAD') {
        return {
          ok: response.ok,
          status: response.status,
          finalUrl: currentUrl,
          redirectChain,
          headers: responseHeaders,
          body: '',
          contentLength: parseInt(responseHeaders['content-length'] || '0', 10),
          contentType,
          timingMs: Date.now() - startTime,
        };
      }

      // Check Content-Length upfront if reported
      const declaredLength = parseInt(responseHeaders['content-length'] || '0', 10);
      if (declaredLength > maxBytes) {
        return {
          ok: false,
          status: response.status,
          finalUrl: currentUrl,
          redirectChain,
          headers: responseHeaders,
          body: '',
          contentLength: declaredLength,
          contentType,
          timingMs: Date.now() - startTime,
          error: `Page size (${Math.round(declaredLength / 1024)} KB) exceeds 2 MB safety cap.`,
          errorCode: 'TOO_LARGE',
        };
      }

      // Stream read with chunk length accumulation
      const reader = response.body?.getReader();
      let receivedBytes = 0;
      const chunks: Uint8Array[] = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            receivedBytes += value.length;
            if (receivedBytes > maxBytes) {
              await reader.cancel();
              return {
                ok: false,
                status: response.status,
                finalUrl: currentUrl,
                redirectChain,
                headers: responseHeaders,
                body: '',
                contentLength: receivedBytes,
                contentType,
                timingMs: Date.now() - startTime,
                error: 'Page content exceeds the 2 MB response limit.',
                errorCode: 'TOO_LARGE',
              };
            }
            chunks.push(value);
          }
        }
      }

      // Concatenate and decode UTF-8 text
      const totalBuffer = new Uint8Array(receivedBytes);
      let offset = 0;
      for (const chunk of chunks) {
        totalBuffer.set(chunk, offset);
        offset += chunk.length;
      }
      const text = new TextDecoder('utf-8', { fatal: false }).decode(totalBuffer);

      return {
        ok: response.ok,
        status: response.status,
        finalUrl: currentUrl,
        redirectChain,
        headers: responseHeaders,
        body: text,
        contentLength: receivedBytes,
        contentType,
        timingMs: Date.now() - startTime,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      const isTimeout = err.name === 'AbortError' || err.message?.includes('aborted');
      return {
        ok: false,
        status: 0,
        finalUrl: currentUrl,
        redirectChain,
        headers: {},
        body: '',
        contentLength: 0,
        contentType: '',
        timingMs: Date.now() - startTime,
        error: isTimeout
          ? `Request timed out after ${timeoutMs / 1000}s.`
          : `Fetch failed: ${err.message || 'Network error'}`,
        errorCode: isTimeout ? 'FETCH_TIMEOUT' : 'FETCH_FAILED',
      };
    }
  }

  return {
    ok: false,
    status: 0,
    finalUrl: currentUrl,
    redirectChain,
    headers: {},
    body: '',
    contentLength: 0,
    contentType: '',
    timingMs: Date.now() - startTime,
    error: 'Too many redirects.',
    errorCode: 'TOO_MANY_REDIRECTS',
  };
}

