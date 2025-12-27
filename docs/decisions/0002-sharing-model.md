# ADR 0002: Sharing Model

## Context

Plans must be shareable with multiple actors while preserving data integrity and enforcing access control consistently.

## Options considered

- Client‑only permission checks.
- Public access with last‑write‑wins.
- Server‑enforced roles and permissions.

## Decision

Use server-enforced memberships with explicit tiers:

- Store ownership on `plans.user_id`.
- Store memberships in `plan_members` with `admin` and `member` tiers.
- Allow admins to manage share links (which add members) and email invites.
- Keep public plans readable via `public_slug`, with edit access gated separately.

## Consequences

- All mutations require permission context (owner/admin/member or explicit edit access).
- Share management stays admin-only; share links always add `member` access.
- Public access remains read-only by default, reducing accidental privilege escalation.
