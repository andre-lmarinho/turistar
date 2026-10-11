# Profile

Provisions user profiles and manages their slug, display name and avatar metadata. The slug identifies the user's dashboard at `/u/[slug]`.

## How it works

- The Auth user creation trigger provisions a profile in the signup transaction, using the requested, normalized username (1–28 characters). Invalid or taken usernames reject signup instead of allocating a different slug. Existing profiles are preserved.
- Auth flows call `ensureProfile` only to resolve the stored slug after a session exists. It performs a read and never creates or updates a profile.
- Profile creation and deletion are unavailable to authenticated clients. Account editing keeps its existing owner policies. The migration refuses to proceed if an existing Auth user has no profile.
- Account updates normalize and validate the username, require a display name and report slug conflicts. Authenticated tRPC handlers supply the viewer's user ID.
- Username availability is exposed by a public tRPC procedure through a [server-only lookup](../auth/lib/isUsernameAvailable.ts).
- The dashboard page checks the viewer and redirects a mismatched URL slug to their own dashboard. Page authorization lives in the route.

## Main files

| File | Responsibility |
| --- | --- |
| [ProfileService.ts](services/ProfileService.ts) | Profile lookup and update rules. |
| [ProfileRepository.ts](repositories/ProfileRepository.ts) | Reads and writes to `profiles`. |
| [validUsername.ts](utils/validUsername.ts) | Username normalization and format rules. |
| [AccountSettingsDialog.tsx](../../modules/layout/AccountSettingsDialog.tsx) | Profile editing UI. |

## Related docs

- [Architecture](../../../ARCHITECTURE.md)
- [Auth](../auth/README.md)
- [Feature guide](../README.md)
