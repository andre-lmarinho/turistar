# Members Feature

Manages planner members and permissions.

## Features
- List members - Returns members with their profiles
- Add by email - Invites existing user
- Change tier - Updates permission (admin/member)
- Remove member - Removes user from planner
- Leave planner - User removes themselves

## Tiers

| Tier     | edit | invite | remove | delete  |
|----------|------|--------|--------|---------|
| `owner`  | Yes  | Yes    | Yes    | Yes     |
| `admin`  | Yes  | Yes    | Yes    | No      |
| `member` | Yes  | No     | No     | No      |
