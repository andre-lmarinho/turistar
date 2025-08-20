# Overview

Turistar is a drag‑and‑drop travel planner built with Next.js 15, React, and TypeScript.
The application lets users create and organize trip itineraries, with plan data stored in Supabase for easy revisits.

## Key Features

- **Welcome Form** – Start a new plan by selecting travel dates.
- **Planner Board** – Rearrange activities between days using drag‑and‑drop.
- **Catalog Popup** – Browse suggested activities and insert them directly into the board.
  - Search the catalog in real time.
- **Persistent Storage** – Planner data and budget are saved in Supabase.
- **Map Mode** – View itinerary on an interactive map built with Leaflet.
- **Sample Inspirations** – Browse pre-built example itineraries for select cities.
- **Multi-destination Ready** – The database supports linking multiple destinations per plan, though the UI currently uses only the first.

## Tech Stack

- **Next.js 15** (App Router)
- **React & TypeScript**
- **Tailwind CSS** for styling
- **@dnd-kit** for drag-and-drop interactions
- **Radix UI** components
- **TanStack Query** for data fetching
- **date-fns** and **react-day-picker** for date management
- **Leaflet** & **React Leaflet** for interactive maps

## Project Structure

/src
├─ app/ – Next.js routes and API endpoints (see [Routing](ROUTING.md))
├─ features/ – Feature modules like home, planner, budget and onboarding
├─ shared/ – Reusable components, hooks, utilities and types
├─ server/ – Server actions and API handlers
└─ data/ – Sample itinerary JSON
/public – Static assets

```ts
import { PlannerControls } from '@/features/planner';
```

## Development

1. Install dependencies with `npm install`.
2. Start the dev server using `npm run dev` and visit `http://localhost:3000`.
3. Format and lint code via `npm run format` and `npm run lint`.
4. Run tests with `npm test`.

## Deployment

The project can be deployed to Vercel or Netlify. Push to GitHub and import the repository into your chosen platform; both handle the build and preview automatically.
