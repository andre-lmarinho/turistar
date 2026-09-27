---
title: Supabase Key Protection
impact: CRITICAL
impactDescription: Prevents credential exposure and unintended privileged access
tags: security, supabase, keys, credentials
---

# Protect Supabase keys

Never expose `SUPABASE_SERVICE_ROLE_KEY` in client code, API responses, logs, or query payloads. Never commit credentials or put privileged keys in `NEXT_PUBLIC_*` variables.

- The [browser client](../../src/supabase/client.ts) uses the public URL and anon key.
- The [request-scoped server client](../../src/supabase/server.ts) uses the public configuration with the caller's session cookies.
- The [service-role client](../../src/supabase/serviceRole.ts) is server-only and privileged. Server-side placement prevents browser exposure; callers must still enforce the authorization required for the operation.
- Return only the data needed by the caller. Use [explicit column selection](data-prefer-select-over-include.md), including in server-side code.

See [configuration](../../CONTRIBUTING.md#configuration) for environment setup and [authorization](architecture-page-level-auth.md) for access boundaries.
