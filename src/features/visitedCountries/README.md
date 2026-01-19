# Visited Countries Feature

Tracks and visualizes countries visited by user based on their travel plans.

## Features
- **Country aggregation** - Automatically extracts unique countries from user's plans
- **Interactive world map** - SVG-based visualization with hover effects
- **User-specific data** - Shows only visited countries for authenticated user
- **Responsive design** - Works on all screen sizes

## Data Flow
```text
VisitedCountries Feature
  └─> Plan Feature (aggregates countries from user's travel plans)
        └─> Search Feature (uses country codes from destination searches)

Country Data
  └─> Profile Feature (displays visited countries on user profile)
        └─> World Map visualization (interactive SVG display)
```