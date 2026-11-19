# Product Vision & Roadmap

## Vision

Turistar is an open-source, collaborative travel planner designed to help people organize and manage their trips.

The goal is to bring itinerary planning, places, maps, expenses, and collaboration into a shared workspace, giving travelers control over how they plan their trips.

## Product scope

Turistar focuses on:

- Individual and group trip planning.
- Visual itinerary organization.
- Destination and activity discovery.
- Geographic visualization of trips.
- Travel budgeting and expense tracking.
- Real-time collaboration.
- Access across different devices.

This scope includes current capabilities and intended product direction. The
[README](README.md#features) summarizes the main capabilities available now. The feature guides linked
from that document describe the implementation in more detail.

## Non-goals

Turistar is not intended to become:

- A flight, hotel, or accommodation booking platform.
- A travel agency or marketplace.
- A general-purpose social network for travelers.
- A travel blog or editorial content platform.
- A general-purpose personal finance application.

## Product principles

- **User control:** travelers should remain in control of their plans.
- **Collaboration:** planning together should be as straightforward as planning alone.
- **Accessibility:** the core experience should work across devices and accommodate different accessibility needs.
- **Simplicity:** new functionality should solve identifiable travel planning problems without adding unnecessary complexity.
- **Privacy:** travelers should control who can access their plans.
- **Sustainability:** functionality should consider long-term maintenance and infrastructure costs.

## Roadmap

The roadmap represents the intended direction of the project, not a commitment to delivery dates or
implementation order. An unchecked item is not complete, even when part of its technical foundation
already exists.

### Planned features

Features accepted into the product roadmap and available for contributions.

#### Planning & itinerary

- [ ] Trip duplication
- [ ] Multi-destination trips
- [ ] Unscheduled activities
- [ ] Activity start times and durations
- [ ] Manual reservation detail tracking, without booking
- [ ] Travel checklists
- [ ] Weather forecasts by destination and itinerary date

#### Maps & transportation

- [ ] Distance between activities
- [ ] Estimated travel times
- [ ] Transportation modes
- [ ] External navigation app integration

#### Budget

- [ ] Multi-currency support
- [ ] Expense splitting between travelers
- [ ] Expense payer tracking
- [ ] Individual expense summaries
- [ ] Expense export

#### Collaboration

- [ ] Invitations for unregistered users
- [ ] Activity suggestions
- [ ] Activity voting
- [ ] Activity comments
- [ ] Read-only trip sharing

#### Portability & mobility

- [ ] Installable Progressive Web App (PWA)
- [ ] Offline itinerary access
- [ ] Offline itinerary editing
- [ ] Automatic synchronization upon reconnection
- [ ] Conflict detection and resolution

### Improvements

Enhancements to existing functionality, usability, and reliability.

- [ ] Improve mobile planning and drag-and-drop interactions.
- [ ] Improve place search results and filtering.
- [ ] Improve map performance and marker clustering.
- [ ] Improve map visualization by day.
- [ ] Improve planned versus actual budget tracking.
- [ ] Improve collaboration feedback and synchronization recovery.
- [ ] Preserve pending changes across page reloads.
- [ ] Improve keyboard navigation and screen reader support.
- [ ] Expand internationalization with additional languages.
- [ ] Simplify onboarding and first-trip creation.
- [ ] Improve dashboard organization, search, and filtering.
- [ ] Simplify self-hosting setup and configuration.

### Under consideration

Ideas that require further product or technical evaluation before implementation. Contributors should discuss these proposals before starting development.

- Route optimization
- Travel documents and attachments
- Automatic reservation import
- Public and cloneable itineraries
- AI-assisted trip planning
- Model Context Protocol (MCP) server
- Native iOS and Android applications
- Trip templates
- Travel reminders and notifications
- Itinerary change history and restoration
- PDF export
- JSON export and import
- Calendar export (ICS)

## Contributing to the roadmap

Contributors are welcome to work on planned roadmap items, bug fixes, accessibility improvements, and
improvements to existing functionality. Open or join a GitHub issue before starting a planned feature
to confirm its scope and avoid duplicate work.

Discuss features under consideration or outside the roadmap through GitHub Issues before
implementation. Moving an item into the planned roadmap requires product and technical review.

For technical requirements and development guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).
