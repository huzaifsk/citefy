import { describe, it, expect } from 'vitest';
import { validateUrlForSsrf, isPrivateOrReservedIp } from '@/lib/fetcher/ssrf';

describe('SSRF Protection', () => {
  it('blocks private and loopback IPs', () => {
    expect(isPrivateOrReservedIp('127.0.0.1')).toBe(true);
    expect(isPrivateOrReservedIp('10.0.0.1')).toBe(true);
    expect(isPrivateOrReservedIp('192.168.1.1')).toBe(true);
    expect(isPrivateOrReservedIp('172.16.0.1')).toBe(true);
    expect(isPrivateOrReservedIp('169.254.169.254')).toBe(true);
    expect(isPrivateOrReservedIp('::1')).toBe(true);
    expect(isPrivateOrReservedIp('8.8.8.8')).toBe(false);
  });

  it('validateUrlForSsrf rejects dangerous URLs', async () => {
    const localhostRes = await validateUrlForSsrf('http://localhost:3000');
    expect(localhostRes.isValid).toBe(false);
    expect(localhostRes.errorCode).toBe('BLOCKED_TARGET');

    const metadataRes = await validateUrlForSsrf('http://169.254.169.254/latest/meta-data');
    expect(metadataRes.isValid).toBe(false);
    expect(metadataRes.errorCode).toBe('BLOCKED_TARGET');

    const credsRes = await validateUrlForSsrf('https://admin:password@example.com');
    expect(credsRes.isValid).toBe(false);
    expect(credsRes.errorCode).toBe('BLOCKED_TARGET');

    const portRes = await validateUrlForSsrf('https://example.com:8080');
    expect(portRes.isValid).toBe(false);
    expect(portRes.errorCode).toBe('BLOCKED_TARGET');

    const ftpRes = await validateUrlForSsrf('ftp://example.com/file');
    expect(ftpRes.isValid).toBe(false);
    expect(ftpRes.errorCode).toBe('BLOCKED_TARGET');
  });
});
