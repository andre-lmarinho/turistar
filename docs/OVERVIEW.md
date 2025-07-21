# Overview

Turistar is a drag‑and‑drop travel planner built with Next.js 15, React, and TypeScript.  
The application lets users create and organize trip itineraries, persisting data in `localStorage` for easy revisits.

## Key Features

- **Welcome Form** – Start a new plan by selecting travel dates.
- **Planner Board** – Rearrange activities between days using drag‑and‑drop.
- **Catalog Popup** – Browse suggested activities and insert them directly into the board.
  - Search the catalog in real time.
- **Local Data Mock** – The catalog is served from a static JSON API.
- **Persistent Storage** – Planner data and budget stay saved in the browser.

## Tech Stack

- **Next.js 15** (App Router)
- **React & TypeScript**
- **Tailwind CSS** for styling
- **@dnd-kit** for drag-and-drop interactions
- **Radix UI** components
- **TanStack Query** for data fetching
- **date-fns** and **react-day-picker** for date management

## Project Structure

/src
├─ components/ – React components
├─ hooks/ – Custom hooks
├─ lib/ – Shared helpers
├─ services/ – External API wrappers
├─ types/ – Shared TypeScript definitions
└─ utils/ – Planner utilities
/public – Static assets

## Development

1. Install dependencies with `npm install`.
2. Start the dev server using `npm run dev` and visit `http://localhost:3000`.
3. Format and lint code via `npm run format` and `npm run lint`.
4. Run tests with `npm test`.

## Deployment

The project can be deployed to Vercel or Netlify. Push to GitHub and import the repository into your chosen platform; both handle the build and preview automatically.
