# Engineering rules

Use the rules relevant to the code you are changing. [AGENTS.md](../../AGENTS.md) defines the required checks and permission boundaries; [ARCHITECTURE.md](../../ARCHITECTURE.md) explains how the current application works.

| Area | Rule |
| --- | --- |
| Architecture | [Authorization at protected entry points](architecture-page-level-auth.md) |
| Architecture | [Domain ownership and vertical slices](architecture-vertical-slices.md) |
| Data | [Explicit column selection](data-prefer-select-over-include.md) |
| Data | [Repository boundaries](data-repository-pattern.md) |
| Data | [Repository method names](data-repository-methods.md) |
| Security | [Supabase key protection](security-supabase-key-protection.md) |
| Quality | [File naming](quality-file-naming-conventions.md) |
| Quality | [Simple implementations](quality-simplicity.md) |
| Patterns | [Early returns](patterns-early-returns.md) |
| Patterns | [Component composition](patterns-composition-over-prop-drilling.md) |
| Testing | [Behavior and coverage](testing-coverage-requirements.md) |
| UI/UX | [Interface guidelines](uiux-interface-guidelines.md) |

## Maintaining rules

Use the [template](_template.md) and an existing [section prefix](_sections.md). State the rule, explain the project-specific reason, and link to current source or a short example. Keep setup commands and architecture explanations in the shared project docs. Update this index when adding a rule.
