# Rule sections

Use these filename prefixes to group related rules. Each rule declares its own impact in frontmatter; the level indicates review priority, not a measured performance gain.

| Prefix | Scope |
| --- | --- |
| `architecture-` | Domain ownership and authorization boundaries |
| `quality-` | Naming, readability, and implementation quality |
| `security-` | Credentials and protection of user data |
| `data-` | Queries, repositories, DTOs, and database boundaries |
| `api-` | Transport, validation, and API contracts |
| `performance-` | Measured runtime or bundle concerns |
| `uiux-` | Interaction, accessibility, and visual behavior |
| `testing-` | Behavior checks and coverage |
| `patterns-` | Reusable implementation patterns |

The [rule index](README.md) lists the rules that currently exist. API and performance prefixes are available for future rules.
