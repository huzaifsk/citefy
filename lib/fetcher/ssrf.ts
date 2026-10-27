import dns from 'node:dns/promises';
import ipaddr from 'ipaddr.js';

export interface ValidatedUrlResult {
  isValid: boolean;
  normalizedUrl: string;
  hostname: string;
  resolvedIp?: string;
  error?: string;
  errorCode?: 'INVALID_URL' | 'BLOCKED_TARGET' | 'DNS_LOOKUP_FAILED';
}

const BLOCKED_HOSTS = new Set([
  'localhost',
  'metadata.google.internal',
  '169.254.169.254',
  'instance-data',
  '100.100.100.200', // Alibaba cloud metadata
]);

/**
 * Checks whether an IP address is considered private, reserved, loopback, or cloud metadata.
 */
export function isPrivateOrReservedIp(ipString: string): boolean {
  try {
    const addr = ipaddr.parse(ipString);
    const range = addr.range();

    // Blocked IP ranges:
    // IPv4: loopback, private, linkLocal, carrierGradeNat, broadcast, reserved, multicast, unspecified
    // IPv6: loopback, uniqueLocal, linkLocal, multicast, unspecified
    const blockedRanges = [
      'loopback',
      'private',
      'linkLocal',
      'uniqueLocal',
      'carrierGradeNat',
      'broadcast',
      'reserved',
      'multicast',
      'unspecified',
    ];

    if (blockedRanges.includes(range)) {
      return true;
    }

    // Special check for AWS / GCP / Azure metadata endpoint: 169.254.169.254
    if (ipString === '169.254.169.254') {
      return true;
    }

    return false;
  } catch {
    return true; // If we cannot parse the IP, treat as unsafe
  }
}

/**
 * Validates a target URL against SSRF rules, resolves DNS, and returns a safe URL.
 */
export async function validateUrlForSsrf(inputUrl: string): Promise<ValidatedUrlResult> {
  let normalized = inputUrl.trim();

  // If no scheme is present at all, auto-add https://
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(normalized)) {
    normalized = `https://${normalized}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return {
      isValid: false,
      normalizedUrl: inputUrl,
      hostname: '',
      error: 'Invalid URL format.',
      errorCode: 'INVALID_URL',
    };
  }

  // Only allow http: and https:
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      isValid: false,
      normalizedUrl: normalized,
      hostname: parsed.hostname,
      error: 'Only HTTP and HTTPS protocols are supported.',
      errorCode: 'BLOCKED_TARGET',
    };
  }

  // Reject URLs with embedded credentials (e.g. user:pass@host)
  if (parsed.username || parsed.password) {
    return {
      isValid: false,
      normalizedUrl: normalized,
      hostname: parsed.hostname,
      error: 'URLs containing user credentials are not allowed.',
      errorCode: 'BLOCKED_TARGET',
    };
  }

  // Only allow default ports or 80 / 443
  const port = parsed.port ? parseInt(parsed.port, 10) : (parsed.protocol === 'https:' ? 443 : 80);
  if (port !== 80 && port !== 443) {
    return {
      isValid: false,
      normalizedUrl: normalized,
      hostname: parsed.hostname,
      error: 'Only standard web ports 80 and 443 are allowed.',
      errorCode: 'BLOCKED_TARGET',
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Check known dangerous hostnames
  if (BLOCKED_HOSTS.has(hostname) || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    return {
      isValid: false,
      normalizedUrl: normalized,
      hostname,
      error: 'Access to local or cloud internal hostnames is prohibited.',
      errorCode: 'BLOCKED_TARGET',
    };
  }

  // Strip fragment (#) and ensure lowercase host
  parsed.hash = '';
  parsed.hostname = hostname;
  const safeNormalizedUrl = parsed.toString();

  // Check if hostname is an IP literal
  if (ipaddr.isValid(hostname)) {
    if (isPrivateOrReservedIp(hostname)) {
      return {
        isValid: false,
        normalizedUrl: safeNormalizedUrl,
        hostname,
        resolvedIp: hostname,
        error: 'Target resolves to a private, loopback, or reserved IP address.',
        errorCode: 'BLOCKED_TARGET',
      };
    }
    return {
      isValid: true,
      normalizedUrl: safeNormalizedUrl,
      hostname,
      resolvedIp: hostname,
    };
  }

  // Resolve DNS to verify IP addresses
  try {
    const lookup = await dns.lookup(hostname, { all: true });
    if (!lookup || lookup.length === 0) {
      return {
        isValid: false,
        normalizedUrl: safeNormalizedUrl,
        hostname,
        error: 'Could not resolve domain name.',
        errorCode: 'DNS_LOOKUP_FAILED',
      };
    }

    for (const record of lookup) {
      if (isPrivateOrReservedIp(record.address)) {
        return {
          isValid: false,
          normalizedUrl: safeNormalizedUrl,
          hostname,
          resolvedIp: record.address,
          error: `Domain resolves to a prohibited internal IP (${record.address}).`,
          errorCode: 'BLOCKED_TARGET',
        };
      }
    }

    return {
      isValid: true,
      normalizedUrl: safeNormalizedUrl,
      hostname,
      resolvedIp: lookup[0].address,
    };
  } catch (err: any) {
    return {
      isValid: false,
      normalizedUrl: safeNormalizedUrl,
      hostname,
      error: `DNS resolution failed: ${err.message || 'unknown error'}`,
      errorCode: 'DNS_LOOKUP_FAILED',
    };
  }
}
