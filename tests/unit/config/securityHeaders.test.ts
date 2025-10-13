import { describe, expect, it } from 'vitest';
import { getSecurityHeaders } from '../../../securityHeaders';

describe('security headers', () => {
  it('includes core hardening headers', () => {
    const headers = getSecurityHeaders(false);
    const keys = new Set(headers.map((h) => h.key));
    expect(keys.has('Strict-Transport-Security')).toBe(true);
    expect(keys.has('X-Content-Type-Options')).toBe(true);
    expect(keys.has('X-Frame-Options')).toBe(true);
    expect(keys.has('Referrer-Policy')).toBe(true);
    expect(keys.has('Permissions-Policy')).toBe(true);
    expect(keys.has('Content-Security-Policy')).toBe(true);
  });

  it('sets CSP with safe defaults', () => {
    const csp =
      getSecurityHeaders(false).find((h) => h.key === 'Content-Security-Policy')?.value ?? '';
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("img-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain('upgrade-insecure-requests');
  });

  it('relaxes CSP for development to support HMR', () => {
    const cspDev =
      getSecurityHeaders(true).find((h) => h.key === 'Content-Security-Policy')?.value ?? '';
    expect(cspDev).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval'");
    // In dev we intentionally omit script-src-elem to avoid quirks
    expect(cspDev).not.toContain('script-src-elem');
    expect(cspDev).toContain('connect-src');
    expect(cspDev).toMatch(/ws:/);
    // Ensure we don't accidentally emit double-quoted tokens (invalid)
    expect(cspDev).not.toContain('"self"');
    expect(cspDev).not.toContain('"unsafe-inline"');
    expect(cspDev).not.toContain('"unsafe-eval"');
  });

  it('uses a conservative, widely supported Permissions-Policy set', () => {
    const pp = getSecurityHeaders(false).find((h) => h.key === 'Permissions-Policy')?.value ?? '';
    expect(pp).toContain('camera=()');
    expect(pp).toContain('microphone=()');
    expect(pp).toContain('geolocation=()');
    expect(pp).toContain('payment=()');
    expect(pp).toContain('fullscreen=(self)');
    // Avoid deprecated/unrecognized features to prevent console warnings
    expect(pp).not.toContain('ambient-light-sensor');
    expect(pp).not.toContain('battery');
    expect(pp).not.toContain('document-domain');
  });
});
