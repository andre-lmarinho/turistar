# Members

Lists plan collaborators and manages membership, roles and leaving a plan.

## How it works

`MembersService` resolves a plan ID or slug, then uses `MembersRepository` to read member profiles or call database functions. The database authorizes membership changes.

| Role | Edit itinerary and expenses | Manage members | Delete plan |
| --- | --- | --- | --- |
| Owner | Yes | Yes | Yes |
| Admin | Yes | Yes | No |
| Member | Yes | No | No |

Ownership is stored on `plans.user_id`; member tiers are `admin` and `member`. Adding someone by email immediately adds an existing registered user. Adding an existing member preserves their tier.

The database prevents removing or demoting the owner and preserves at least one admin. When an owner leaves, ownership transfers to the oldest remaining admin. Leaving fails if no admin can remain.

## Main files

| File | Responsibility |
| --- | --- |
| [MembersService.ts](services/MembersService.ts) | Plan resolution and member operations. |
| [MembersRepository.ts](repositories/MembersRepository.ts) | Member/profile reads and membership RPCs. |
| [types.ts](types.ts) | Member response types and tier options. |
| [SharePlannerDialog.tsx](../../modules/planner/components/SharePlannerDialog.tsx) | Member management UI. |

## Related docs

- [Architecture](../../../ARCHITECTURE.md)
- [Plan](../plan/README.md)
- [Feature guide](../README.md)
