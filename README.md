# Turistar – Drag-and-Drop Travel Planner

A simple travel planner built with Next.js, React and drag‑and‑drop. Select any city to generate a starter itinerary that you can rearrange and edit as you like. Plans persist via Supabase so they stick around between visits.

🔗 [Live Demo](https://travel-planner-orpin.vercel.app/)

## Table of Contents

- [About the Project](#-about-the-project)
- [Snapshots](#-snapshots-of-the-project)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [User Flow](#-user-flow)
- [Getting Started](#-getting-started)
- [Scripts](#-scripts)
- [Deployment](#-deployment)
- [Developer Guide](#-developer-guide)
- [What I Focused On](#-what-i-focused-on)
- [License](#-license)

## ✨ About the Project

Turistar is a UX-focused travel planner designed to showcase front-end architecture, state management, and interaction design using modern tools like DnD Kit, Radix UI, and the App Router in Next.js 15.

A new **Map View** lets you preview your itinerary locations on an interactive map.

---

## 📷 Snapshots of the project

![Turistar Planner Screenshot](./public/previews/preview_01.png)

![Attractions Card Screenshot](./public/previews/preview_03.png)

![Attractions Card Screenshot - Right Click](./public/previews/preview_04.png)

![Map View Screenshot](./public/previews/preview_05.png)

---

## 🚀 Key Features

- **Welcome Form**
  Enter your trip dates to start a new plan.
- **Planner Board**
  Drag activities between days or add blank cards to build your schedule.
- **Destination Search**
  Quickly find attractions with Geoapify-powered search and autocomplete.
- **Map View**
  View all your planned attractions on an interactive map.
  - **Persistent Storage**
    All planner changes, including budget, are saved to Supabase so they stay when you refresh.
- **Accessibility & Responsive Design**
  Fully keyboard-accessible with layouts optimised for mobile and desktop.
- **Sample Plan**
  Try the interactive sample itineraries from the home page links.

You can deploy the same app to Vercel or Netlify.

---

## 🏗️ Tech Stack

- **Next.js 15** (App Router)
- **React** & **TypeScript**
- **Tailwind CSS** for styling
- **@dnd-kit/core** & **@dnd-kit/sortable** for drag-and-drop
- **Radix UI** components
- **TanStack Query** for data fetching
- **date-fns** and **react-day-picker** for date handling
- **leaflet** & **react-leaflet** for the map view
- **Vercel** or **Netlify** for hosting

---

## 📁 Project Structure

- `/docs`: Project notes and guidelines (see [ARCHITECTURE.md](docs/ARCHITECTURE.md) for an overview of data flow)
- `/public`: Static assets served directly
  - `/src`: Source code to be analyzed and maintained by AI agents
    - `/app`: Next.js app directory with pages and API routes
    - `/features`: Feature modules such as home, planner and onboarding (budget is part of planner)
    - `/shared`: Shared UI components, hooks, utilities and types
  - `/server`: Server actions and API handlers
  - `/data`: Local JSON used for demo itineraries

```ts
import { PlannerControls } from '@/features/planner';
```

See [Developer Guide](docs/DEVELOPER_GUIDE.md#routing) for a breakdown of the `src/app` directory.

---

## 💻 Getting Started

**Prerequisites**: Node.js v18+, npm

1. **Clone the repo**

   ```bash
   git clone https://github.com/andre-lmarinho/travel-planner.git
   cd travel-planner
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn
   # or
   pnpm install
   ```

3. **Configure environment**
   Copy `.env.example` to `.env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_GEOAPIFY_KEY`

   See [Developer Guide](docs/DEVELOPER_GUIDE.md#environment) for details.

4. **Start the dev server**
   ```bash
   npm run dev
   ```
   Visit <http://localhost:3000> in your browser.

### Development Workflow

1. Install dependencies with `npm install`.
2. Start the dev server using `npm run dev`.
3. Format code before committing with `npm run format`.
4. Run the linter via `npm run lint`.
5. Run the type checker with `npm run typecheck`.
6. Ensure all tests pass with `npm run test`.
7. Follow the commit message style: start with an appropriate Gitmoji followed by a short, capitalized description in English (see [commit message examples](docs/CONTRIBUTING.md#sample-commit-messages)). Commitlint enforces this format.

---

## 📦 Scripts

- `npm run dev` — start development server
- `npm run build` — compile for production
- `npm run start` — run production build locally
- `npm run lint` — run ESLint
- `npm run format` — run Prettier
- `npm run test` — run unit tests

### Local Vercel build

```bash
npm run vercel:pull
npm run vercel:build
```

## 🧪 Testing

See [docs/TESTING.md](docs/TESTING.md) for details on the Vitest setup and testing approach.

---

## ☁️ Deployment

Deploy easily to **Vercel** or **Netlify**:

1. Push your code to GitHub.
2. Import the repository in your hosting service (https://vercel.com/new or https://app.netlify.com/start).
3. Add the required environment variables:
   - `NEXT_PUBLIC_GEOAPIFY_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click "Deploy" — the platform will build and preview automatically.

_For detailed guides, see:_

- Next.js Deployment Docs: https://nextjs.org/docs/app/building-your-application/deploying
- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com/

## Contributing

Please read [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) before submitting pull requests.

Additional docs: [Architecture](docs/ARCHITECTURE.md), [Testing](docs/TESTING.md), [Deployment](docs/DEPLOYMENT.md), [Developer Guide](docs/DEVELOPER_GUIDE.md).

---

## 🛠️ Developer Guide

For more details on project conventions, see:

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Testing](docs/TESTING.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Developer Guide](docs/DEVELOPER_GUIDE.md)
- [Contributing](docs/CONTRIBUTING.md)

---

## 📜 License

This project is open-source under the [MIT License](LICENSE).
Feel free to reuse and adapt!

---

Built with 💙 by André Marinho  
Feel free to ⭐ this repo if you find it useful!
