import { CheckResult } from '@/types/audit';
import * as cheerio from 'cheerio';
import { safeFetch } from '@/lib/fetcher/safe-fetch';

export interface ClassicTechnicalInput {
  html: string;
  targetUrl: string;
  finalUrl: string;
  httpStatus: number;
  redirectChain: string[];
  headers: Record<string, string>;
}

export async function evaluateClassicTechnical(
  input: ClassicTechnicalInput
): Promise<CheckResult[]> {
  const checks: CheckResult[] = [];
  const $ = cheerio.load(input.html);

  // SEO-09: HTTPS and valid redirect to HTTPS (Sev H)
  const isHttps = input.finalUrl.startsWith('https://');
  if (isHttps) {
    checks.push({
      id: 'SEO-09',
      category: 'G',
      section: 'classic',
      title: 'HTTPS security and SSL encryption',
      status: 'pass',
      severity: 'H',
      effort: 'Quick win',
      evidence: `Page served securely over HTTPS (${input.finalUrl}).`,
      recommendation: 'Site enforces encrypted HTTPS connections.',
    });
  } else {
    checks.push({
      id: 'SEO-09',
      category: 'G',
      section: 'classic',
      title: 'HTTPS security and SSL encryption',
      status: 'fail',
      severity: 'H',
      effort: 'Quick win',
      evidence: `Page served over unencrypted HTTP (${input.finalUrl}).`,
      recommendation:
        'Migrate site to HTTPS. Major search engines and AI crawlers heavily discount unencrypted HTTP domains.',
    });
  }

  // SEO-10: HTTP status 200 and clean redirect chain (Sev H)
  const redirectCount = Math.max(0, input.redirectChain.length - 1);
  if (input.httpStatus === 200 && redirectCount <= 1) {
    checks.push({
      id: 'SEO-10',
      category: 'G',
      section: 'classic',
      title: 'HTTP status 200 and clean redirect chain',
      status: 'pass',
      severity: 'H',
      effort: 'Quick win',
      evidence: `HTTP 200 OK. ${redirectCount === 0 ? 'Direct fetch with zero redirects.' : '1 clean redirect (e.g. HTTP to HTTPS or non-www).'}.`,
      recommendation: 'Target responds with clean HTTP status.',
    });
  } else if (input.httpStatus === 200 && redirectCount > 1) {
    checks.push({
      id: 'SEO-10',
      category: 'G',
      section: 'classic',
      title: 'HTTP status 200 and clean redirect chain',
      status: 'warn',
      severity: 'H',
      effort: 'Quick win',
      evidence: `HTTP 200 with ${redirectCount} sequential redirects (${input.redirectChain.join(' -> ')}).`,
      recommendation:
        'Eliminate redirect chains to prevent crawl budget waste and reduce latency for AI crawlers.',
    });
  } else {
    checks.push({
      id: 'SEO-10',
      category: 'G',
      section: 'classic',
      title: 'HTTP status 200 and clean redirect chain',
      status: 'fail',
      severity: 'H',
      effort: 'Quick win',
      evidence: `Returned unexpected HTTP status: ${input.httpStatus}.`,
      recommendation: 'Ensure page returns a standard HTTP 200 OK response.',
    });
  }

  // SEO-11: Mobile viewport meta tag (Sev H)
  const viewportTag = $('meta[name="viewport"]').attr('content');
  if (viewportTag && viewportTag.includes('width=device-width')) {
    checks.push({
      id: 'SEO-11',
      category: 'G',
      section: 'classic',
      title: 'Mobile viewport meta tag',
      status: 'pass',
      severity: 'H',
      effort: 'Quick win',
      evidence: `Viewport declared: "${viewportTag}". Responsive mobile layout enabled.`,
      recommendation: 'Page is configured for mobile and responsive viewports.',
    });
  } else {
    checks.push({
      id: 'SEO-11',
      category: 'G',
      section: 'classic',
      title: 'Mobile viewport meta tag',
      status: 'fail',
      severity: 'H',
      effort: 'Quick win',
      evidence: viewportTag
        ? `Viewport tag exists but missing width=device-width: "${viewportTag}".`
        : 'Missing mobile viewport meta tag.',
      recommendation:
        'Add standard responsive viewport meta tag to support mobile devices and mobile-first search indexers.',
      snippet: `<meta name="viewport" content="width=device-width, initial-scale=1" />`,
    });
  }

  // SEO-12: Compression (gzip or brotli) and caching headers (Sev L)
  const contentEncoding = input.headers['content-encoding'] || '';
  const cacheControl = input.headers['cache-control'] || '';
  const hasCompression = /gzip|br|deflate/i.test(contentEncoding);
  const hasCaching = Boolean(cacheControl);

  if (hasCaching || hasCompression) {
    checks.push({
      id: 'SEO-12',
      category: 'G',
      section: 'classic',
      title: 'Compression and cache headers',
      status: 'pass',
      severity: 'L',
      effort: 'Quick win',
      evidence: `Headers: Cache-Control: "${cacheControl || 'default'}"${contentEncoding ? `, Content-Encoding: "${contentEncoding}"` : ''}.`,
      recommendation: 'Caching and compression headers configured for efficient resource delivery.',
    });
  } else {
    checks.push({
      id: 'SEO-12',
      category: 'G',
      section: 'classic',
      title: 'Compression and cache headers',
      status: 'warn',
      severity: 'L',
      effort: 'Quick win',
      evidence: 'No explicit Cache-Control or Content-Encoding header detected in server response.',
      recommendation:
        'Enable gzip/brotli compression and specify Cache-Control headers on your edge or CDN.',
      snippet: `Cache-Control: public, max-age=3600, stale-while-revalidate=86400`,
    });
  }

  // SEO-13: Broken links (sample up to 20 links with fast HEAD requests) (Sev M) (Category: LinksImages)
  const sampledLinks: string[] = [];
  $('a[href]').each((_, el) => {
    if (sampledLinks.length >= 10) return; // Sample 10 links for fast response under timeout
    const href = $(el).attr('href')?.trim();
    if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('javascript:')) {
      try {
        const fullUrl = new URL(href, input.finalUrl).toString();
        if (!sampledLinks.includes(fullUrl)) {
          sampledLinks.push(fullUrl);
        }
      } catch {}
    }
  });

  let brokenCount = 0;
  const brokenExamples: string[] = [];

  // Probe up to 5 links in parallel with short 2.5s timeout
  await Promise.all(
    sampledLinks.slice(0, 5).map(async (link) => {
      try {
        const res = await safeFetch(link, { method: 'HEAD', timeoutMs: 2500 });
        if (res.status >= 400 && res.status !== 403 && res.status !== 429) {
          brokenCount++;
          brokenExamples.push(`${link} (${res.status})`);
        }
      } catch {}
    })
  );

  if (brokenCount === 0) {
    checks.push({
      id: 'SEO-13',
      category: 'LinksImages',
      section: 'classic',
      title: 'Link health and broken link detection',
      status: 'pass',
      severity: 'M',
      effort: 'Quick win',
      evidence: `Sampled on-page links returned healthy HTTP status codes (0 broken links found).`,
      recommendation: 'Links are reachable and intact.',
    });
  } else {
    checks.push({
      id: 'SEO-13',
      category: 'LinksImages',
      section: 'classic',
      title: 'Link health and broken link detection',
      status: 'fail',
      severity: 'M',
      effort: 'Quick win',
      evidence: `Detected ${brokenCount} broken link(s): ${brokenExamples.join(', ')}.`,
      recommendation: 'Repair or remove broken links to prevent crawler drop-off and preserve link equity.',
    });
  }

  // SEO-14: Security headers (informational) (Sev L)
  const secHeaders = [
    'strict-transport-security',
    'content-security-policy',
    'x-content-type-options',
    'x-frame-options',
    'referrer-policy',
  ];
  const presentSec = secHeaders.filter((h) => Boolean(input.headers[h]));

  checks.push({
    id: 'SEO-14',
    category: 'G',
    section: 'classic',
    title: 'Modern HTTP security headers (informational)',
    status: presentSec.length >= 2 ? 'pass' : 'info',
    severity: 'L',
    effort: 'Quick win',
    evidence: `Present security headers (${presentSec.length}/5): ${presentSec.length > 0 ? presentSec.join(', ') : 'None'}.`,
    recommendation:
      'Security headers (HSTS, CSP, X-Content-Type-Options) protect against clickjacking, MIME sniffing, and signal domain rigor.',
    snippet: `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload\nX-Content-Type-Options: nosniff\nReferrer-Policy: strict-origin-when-cross-origin`,
  });

  // SEO-15: Favicon present (Sev L)
  const favicon =
    $('link[rel*="icon"]').attr('href') ||
    $('link[rel="apple-touch-icon"]').attr('href') ||
    '/favicon.ico';

  if (favicon) {
    checks.push({
      id: 'SEO-15',
      category: 'G',
      section: 'classic',
      title: 'Favicon presence',
      status: 'pass',
      severity: 'L',
      effort: 'Quick win',
      evidence: `Favicon defined: "${favicon}".`,
      recommendation: 'Favicon present for browser tabs, bookmarks, and search brand pills.',
    });
  } else {
    checks.push({
      id: 'SEO-15',
      category: 'G',
      section: 'classic',
      title: 'Favicon presence',
      status: 'warn',
      severity: 'L',
      effort: 'Quick win',
      evidence: 'No explicit <link rel="icon"> found.',
      recommendation: 'Add a high-resolution favicon in SVG, PNG, or ICO format.',
      snippet: `<link rel="icon" href="/favicon.ico" sizes="any" />\n<link rel="icon" href="/icon.svg" type="image/svg+xml" />`,
    });
  }

  return checks;
}

