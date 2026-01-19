# Profile Feature

Manages user profiles with slug-based routing and auto-creation.

## Features
- **Auto-create profile** - Creates profile on user signup with unique slug
- **Profile lookup** - Fetch profiles by slug or user ID
- **Slug validation** - Checks username availability and format
- **Access control** - Ensures users can only access their own profile pages

## Data Flow
```text
Profile Feature
  └─> Auth Feature (auto-create profiles on signup)
        └─> Members Feature (display user info in member lists)

Profile Data
  └─> Search Feature (country codes from destinations)
        └─> VisitedCountries Feature (aggregate countries from user plans)
```

## Dependencies

- `@/features/auth/`