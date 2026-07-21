# Auth Feature

Handles user authentication with Supabase and session management.

## Features
- **Sign up** - Creates new user with profile and unique slug
- **Sign in** - Validates credentials and creates session
- **Sign out** - Clears session and redirects
- **Password reset** - Email-based password recovery
- **Session validation** - Server-side auth checks for protected routes

## Data Flow
```text
Auth Feature
  └─> Profile Feature (auto-create profiles on signup)
        └─> Members Feature (user identification in plan members)

Middleware
  └─> All protected routes (/u/*)
        └─> Plan, Budget (user-specific data)
```
