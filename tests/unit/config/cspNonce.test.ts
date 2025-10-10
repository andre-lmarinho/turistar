import { describe, expect, it } from 'vitest';
import { buildCsp } from '../../../securityHeaders';

describe('CSP with nonce (prod)', () => {
  it('includes a nonce and strict-dynamic in script-src', () => {
    const csp = buildCsp({ isDev: false, nonce: 'abc123' });
    expect(csp).toContain("script-src 'self' 'strict-dynamic' 'nonce-abc123'");
    expect(csp).toContain("script-src-elem 'self' 'nonce-abc123'");
    const scriptSrc = csp.split('; ').find((d) => d.startsWith('script-src')) ?? '';
    const scriptSrcElem = csp.split('; ').find((d) => d.startsWith('script-src-elem')) ?? '';
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    expect(scriptSrc).not.toContain("'unsafe-eval'");
    expect(scriptSrcElem).not.toContain("'unsafe-inline'");
    expect(scriptSrcElem).not.toContain("'unsafe-eval'");
  });

  it('omits nonce when not provided', () => {
    const csp = buildCsp({ isDev: false });
    expect(csp).toContain("script-src 'self' https:");
    expect(csp).toContain("script-src-elem 'self' https:");
  });
});

describe('CSP in dev', () => {
  it('allows inline/eval and omits script-src-elem to support HMR', () => {
    const csp = buildCsp({ isDev: true });
    expect(csp).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval'");
    expect(csp).not.toContain('script-src-elem');
    expect(csp).toMatch(/connect-src .*ws:/);
  });
});
