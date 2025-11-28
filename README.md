# Turistar: Drag-and-Drop Travel Planner

A simple travel planner built with Next.js, React, and drag-and-drop. Select any city to generate a starter itinerary you can rearrange and edit. Plans persist via Supabase so they stick around between visits.

- Live Demo: https://travel-planner-orpin.vercel.app/

## Table of Contents

- [About the Project](#about-the-project)
- [Snapshots](#snapshots-of-the-project)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Testing](#testing)
- [Health Endpoint](#health-endpoint)
- [Deployment](#deployment)
- [Developer Guide](#developer-guide)
- [License](#license)

## About the Project

Turistar is a UX-focused travel planner designed to showcase front-end architecture, state management, and interaction design using modern tools like DnD Kit, Radix UI, and the App Router in Next.js 15.

A Map View lets you preview your itinerary locations on an interactive map.

---

## Snapshots of the Project

![Turistar Planner Screenshot](./.github/assets/preview_01.png)

---

## Key Features

- Welcome Form: enter your trip dates to start a new plan.
- Planner Board: drag activities between days or add blank cards to build your schedule.
- Destination Search: quickly find attractions with Geoapify-powered search and autocomplete.
- Map View: see all planned attractions on an interactive map.
- Persistent Storage: all planner changes, including budget, are saved to Supabase.
- Accessibility & Responsive Design: keyboard-accessible and optimized for mobile and desktop.
- Sample Plans: try the interactive sample itineraries from the home page.

---

## Tech Stack

- Next.js 15 (App Router)
- React & TypeScript
- Tailwind CSS for styling
- @dnd-kit/core & @dnd-kit/sortable for drag-and-drop
- Radix UI components
- TanStack Query for data fetching
- date-fns and react-day-picker for date handling
- leaflet & react-leaflet for the map view
- Vercel or Netlify for hosting

---

## Project Structure

- `/docs`: Project notes and guidelines (see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for data flow)
- `/src`: Application source code
  - `/app`: Next.js app directory with pages and API routes
  - `/features`: Feature modules such as home, planner, and onboarding (budget is part of planner)
  - `/shared`: Shared UI components, hooks, utilities, and types
  - `/server`: Server actions and API handlers
  - `/data`: Local JSON used for demo itineraries
- `/public`: Static assets served directly

See [docs/DEVELOPER_GUIDE.md#routing](docs/DEVELOPER_GUIDE.md#routing) for a breakdown of the `src/app` directory.

---

## Getting Started

Prerequisites: Node.js v18+ and npm

1. Clone the repo

   ```bash
   git clone https://github.com/andre-lmarinho/travel-planner.git
   cd travel-planner
   ```

2. Install dependencies

   ```bash
   npm install
   # or
   yarn
   # or
   pnpm install
   ```

3. Configure environment

   Copy `.env.example` to `.env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-side secret used by actions that require privileged Supabase access)
   - `NEXT_PUBLIC_GEOAPIFY_KEY`

   See [docs/DEVELOPER_GUIDE.md#environment](docs/DEVELOPER_GUIDE.md#environment) for details.

   ### Supabase Auth configuration

   Supabase Auth depends on the following variables:

   | Variable                        | Scope           | Purpose                                                                                                                                                              |
   | ------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | `NEXT_PUBLIC_SUPABASE_URL`      | Client & Server | Base URL for your Supabase project.                                                                                                                                  |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client & Server | Public anon key that allows the browser client to authenticate.                                                                                                      |
   | `SUPABASE_SERVICE_ROLE_KEY`     | Server only     | Optional service role key for server actions that need to call privileged RPCs (e.g., inserting server-generated plans). Keep this secret out of the browser bundle. |

4. Start the dev server

   ```bash
   npm run dev
   ```

   Visit http://localhost:3000

   Authenticated users land on the dashboard at `/u/{yourSlug}/planners`, which lists every owned itinerary and exposes quick
   actions for opening the secure editor at `/planner/{planId}`. Attempts to visit `/login` or `/signup` while already signed
   in automatically redirect back to that dashboard entry point, while unauthenticated visitors who follow `/u/...` links are
   sent to `/login`. Public viewers (or collaborators with edit tokens) continue to use the shareable `/planner/{publicSlug}`
   URLs.

### Development Workflow

1. Install dependencies with `npm install`.
2. Start the dev server using `npm run dev`.
3. Format code before committing with `npm run format` (this covers application code, tests, and documentation files).
4. Run the linter via `npm run lint`.
5. Run the type checker with `npm run typecheck`.
6. Ensure all tests pass with `npm run test`.
7. Write clear commit messages that summarize your changes (see [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)).

---

## Scripts

- `npm run dev` – start development server
- `npm run build` – compile for production
- `npm run start` – run production build locally
- `npm run lint` – run ESLint
- `npm run format` – format repository files with Prettier
- `npm run test` – run unit tests

### Local Vercel build

```bash
npm run vercel:pull
npm run vercel:build
```

---

## Testing

See [docs/TESTING.md](docs/TESTING.md) for details on the Vitest setup and testing approach.

### Coverage reporting

- The Vitest configuration enables coverage automatically in CI, so `npm run test` on GitHub Actions produces the `coverage/` directory with `lcov.info`.
- To generate coverage locally, run `CI=true npm run test` (or export `CI=true` in your shell) to mirror the CI environment.
- Private forks need to create a Codecov token from [Codecov repository settings](https://app.codecov.io/) and add it as `CODECOV_TOKEN` in their fork's GitHub repository secrets so the CI job can upload coverage results.

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md#codecov-and-private-forks) for step-by-step instructions.

### Node.js version management

The project tracks its active Node.js release in both `.nvmrc` and the `engines.node` field inside `package.json`. When upgrading Node.js, update **both** locations in the same pull request so local development, CI, and deployments remain consistent.

---

## Health Endpoint

- Path: `/health`
- Method: `GET`
- Response: `{ "status": "ok", "version": "<package.json version>" }`

Example:

```bash
curl -s http://localhost:3000/health
```

---

## Deployment

Deploy to Vercel or Netlify:

1. Push your code to GitHub.
2. Import the repository in your hosting service (https://vercel.com/new or https://app.netlify.com/start).
3. Add the required environment variables:
   - `NEXT_PUBLIC_GEOAPIFY_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click "Deploy" – the platform will build and preview automatically.

References:

- Next.js Deployment Docs: https://nextjs.org/docs/app/building-your-application/deploying
- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com/

---

## Developer Guide

For more details on project conventions, see:

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Testing](docs/TESTING.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Developer Guide](docs/DEVELOPER_GUIDE.md)
- [SEO Setup](docs/SEO.md)
- [Contributing](docs/CONTRIBUTING.md)

---

## License

This project is open-source under the [GNU Affero General Public License v3.0](LICENSE).

---

Built by André Marinho. Feel free to star this repo if you find it useful!
