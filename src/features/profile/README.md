# Profile Feature

Manages user profiles with slug-based routing and auto-creation.

## Features
- **Auto-create profile** - Creates profile on user signup with unique slug
- **Profile lookup** - Fetch profiles by slug or user ID
- **Slug validation** - Checks username availability and format
- **Access control** - Ensures users can only access their own profile pages

## Data Flow
```text
Auth Feature (signup and redirects)
  └─> ProfileService (profile lookup, creation and updates)
        └─> ProfileRepository
```

## Boundaries

- Username normalization and validation live in `utils/validUsername.ts`.
- Profile creation accepts user data without depending on the Auth feature.
- Shared error types live in `@/lib/errors/`.
