# Auth

Handles Supabase sign-in, registration, password recovery and server-side viewer lookup. Forms live in the [auth module](../../modules/README.md).

## How it works

- Browser handlers call Supabase Auth. Sign-in resolves the user's profile; registration finalizes it when a session is available, or returns a confirmation-required result.
- Password recovery sends an email, exchanges the returned code for a session and updates the password.
- `getViewer` validates the server request with `auth.getUser()`. Pages use the viewer to enforce route access; tRPC uses it for authenticated procedures.
- [proxy.ts](../../../proxy.ts) refreshes session cookies and supplies CSP headers. The `/u/[slug]` and `/p/[planId]` pages own their access checks.
- Sign-out is handled by [AvatarMenu](../../modules/layout/AvatarMenu.tsx).

## Main files

| File | Responsibility |
| --- | --- |
| [signInWithPassword.ts](handlers/signInWithPassword.ts) | Sign-in and profile resolution. |
| [registerWithPassword.ts](handlers/registerWithPassword.ts) | Registration and email-confirmation outcome. |
| [exchangeResetPasswordSession.ts](handlers/exchangeResetPasswordSession.ts) | Recovery session exchange. |
| [session.ts](lib/session.ts) | Server viewer lookup. |
| [redirect.ts](lib/redirect.ts) | Local redirect validation and auth URLs. |

## Related docs

- [Architecture](../../../ARCHITECTURE.md)
- [Profile](../profile/README.md)
- [Feature guide](../README.md)
