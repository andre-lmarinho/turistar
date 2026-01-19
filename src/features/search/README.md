# Search Feature

Location and activity search using Geoapify and Wikidata APIs with autocomplete.

## Features
- **Destination search** - Cities, states, and countries for planner creation
- **Address search** - Street-level locations for activity addresses
- **Activity search** - Points of interest and attractions
- **Autocomplete** - Real-time suggestions with debouncing and caching
- **Keyboard navigation** - Full accessibility support

## Data Flow

```text
┌─────────────────────────────────────────────────────────────┐
│ Search Feature                                              │
│   • Provides activity location and title search             │
│   • Provides destination search for planner creation        │
└────┬────────────────────────────────────────────────────────┘
     │
     ├──> Activity Feature (activity search)
     │      └──> Plan Feature
     │
     ├──> Plan Feature (destination search)
     │
     └──> VisitedCountries Feature (country codes)
            └──> Profile Feature (user location data)
```