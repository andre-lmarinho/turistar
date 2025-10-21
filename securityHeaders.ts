// Centralized security headers applied by Next.js via next.config.ts.
// We keep a strict CSP in production and relax it in development to support Next.js Dev/HMR.

export type Header = { key: string; value: string };

export function buildCsp({ isDev, nonce }: { isDev: boolean; nonce?: string }): string {
  const common = [
    "default-src 'self'",
    "style-src 'self' 'unsafe-inline' https:",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    'upgrade-insecure-requests',
  ];

  if (isDev) {
    // Allow Next.js Dev/HMR inline scripts, eval, and websockets locally
    common.push(
      // Broadly allow during dev; rely on strict prod CSP for security
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: http: https:",
      // Do not emit script-src-elem in dev to avoid browser quirks with inline scripts
      'connect-src http: https: ws: wss:',
      'worker-src blob: data: http: https:'
    );
  } else {
    // Production: disallow inline/eval
    const scriptDirectives: string[] = [
      "script-src 'self' https:",
      "script-src-elem 'self' https:",
    ];
    if (nonce) {
      // Allow only scripts with our nonce and trust dynamically added scripts from those
      scriptDirectives[0] = `script-src 'self' 'strict-dynamic' 'nonce-${nonce}' https:`;
      scriptDirectives[1] = `script-src-elem 'self' 'nonce-${nonce}' https:`;
    }
    common.push(...scriptDirectives, "connect-src 'self' https:", "worker-src 'self'");
  }

  return common.join('; ');
}

function buildPermissionsPolicy(): string {
  // Use a conservative, broadly-supported subset to avoid browser warnings.
  // Deny by default unless explicitly needed by the app.
  // prettier-ignore
  return ['camera=()', 'microphone=()', 'geolocation=()', 'payment=()', 'fullscreen=(self)'].join(', ');
}

export function getSecurityHeaders(isDev: boolean): Header[] {
  const headers: Header[] = [
    // Disable MIME type sniffing
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    // Clickjacking protection
    { key: 'X-Frame-Options', value: 'DENY' },
    // More privacy-preserving referrers
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    // Basic permission policy (tighten as features are added)
    { key: 'Permissions-Policy', value: buildPermissionsPolicy() },
    // Content Security Policy, environment-aware
    { key: 'Content-Security-Policy', value: buildCsp({ isDev }) },
  ];
  if (!isDev) {
    headers.unshift({
      key: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains; preload',
    });
  }
  return headers;
}
