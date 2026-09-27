# Profile

Provisions user profiles and manages their slug, display name and avatar metadata. The slug identifies the user's dashboard at `/u/[slug]`.

## How it works

- Auth flows call `ensureProfile` after a session exists. It derives profile fields from user metadata or email, writes the profile and retries a conflicting slug with the user ID appended.
- Account updates normalize and validate the username, require a display name and report slug conflicts. Authenticated tRPC handlers supply the viewer's user ID.
- Username availability is exposed by a public tRPC procedure through a [server-only lookup](../auth/lib/isUsernameAvailable.ts).
- The dashboard page checks the viewer and redirects a mismatched URL slug to their own dashboard. Page authorization lives in the route.

## Main files

| File | Responsibility |
| --- | --- |
| [ProfileService.ts](services/ProfileService.ts) | Provisioning, profile lookup and update rules. |
| [ProfileRepository.ts](repositories/ProfileRepository.ts) | Reads and writes to `profiles`. |
| [validUsername.ts](utils/validUsername.ts) | Username normalization and format rules. |
| [AccountSettingsDialog.tsx](../../modules/layout/AccountSettingsDialog.tsx) | Profile editing UI. |

## Related docs

- [Architecture](../../../ARCHITECTURE.md)
- [Auth](../auth/README.md)
- [Feature guide](../README.md)
