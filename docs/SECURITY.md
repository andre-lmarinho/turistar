# Security

This document summarizes the security posture and operational practices for Turistar.

- Secrets: Never commit `.env.*` files. Use `.env.example` as a template and store secrets in your hosting provider (e.g., Vercel env vars). Local `.env.local` is ignored by Git.
- Headers: The app sets hardened defaults via centralized `config/securityHeaders.ts` applied in `next.config.ts`.
- CSP: A conservative Content Security Policy blocks mixed content, object embeds, and forbids frame ancestors.
- Dependencies: CI runs dependency review and CodeQL static analysis on every PR. Dependabot keeps dependencies up to date.
- Vulnerability Management: Run `npm audit` regularly and prefer applying non‑breaking upgrades. For critical issues, cut a hotfix release.
- Rate Limiting: Public API routes are read‑only and validate inputs. For production at scale, introduce a distributed rate limiter (e.g., Upstash, Redis) at the edge or via WAF rules.
- Error Handling: Server routes catch and normalize errors with non‑leaky messages.
- Observability: Add your APM or Sentry DSN via env var to enable telemetry. Avoid logging secrets.

## Reporting

Please open a private security advisory or contact the maintainers for any potential vulnerability. Do not open public issues for undisclosed security vulnerabilities.
