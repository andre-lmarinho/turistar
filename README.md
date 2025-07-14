# Turistar – Drag-and-Drop Travel Planner

Next.js + DnD Kit

A simple travel planner built with Next.js, React and drag‑and‑drop. Select your travel dates to Salvador/Brazil to generate a starter plan (from a local JSON API) that you can rearrange and edit as you like. Plans are saved to `localStorage` so they stick around between visits.

🔗 [Live Demo](https://travel-planner-orpin.vercel.app/)
_or_ deploy easily to Vercel or Netlify with the same settings.

## ✨ About the Project

Turistar is a UX-focused travel planner designed to showcase front-end architecture, state management, and interaction design using modern tools like DnD Kit, Radix UI, and the App Router in Next.js 15.

---

## 📷 Snapshots of the project

![Turistar Planner Screenshot](./public/preview_01.png)

![Catalog of Atractions Screenshot](./public/preview_02.png)

![Atractions Card Screenshot](./public/preview_03.png)

![Atractions Card Screenshot - Right Click](./public/preview_04.png)

---

## 🚀 Key Features

- **Welcome Form**
  Enter your trip dates to start a new plan.
- **Planner Board**
  Drag activities between days or add blank cards to build your schedule.
- **Catalog Popup**
  Browse suggested activities and insert them directly into the board.
  - **Search Catalog**
    Quickly filter activities by typing a query.
- **Local Data Mock**
  Demo catalog comes from `/api/catalog`, which serves a static JSON file.
- **Persistent Storage**
  All changes are saved to `localStorage` so your plan stays when you refresh.

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
- **Vercel** or **Netlify** for hosting

---

## 📁 Project Structure

- `/src`: Source code to be analyzed and maintained by AI agents
  - `/components`: React components that should follow the guidelines in this document
  - `/hooks`: Custom React hooks
  - `/lib`: Internal utilities
  - `/services`: External API wrappers
  - `/types`: Shared TypeScript definitions
  - `/utils`: Planner-specific helpers

---

## 🧭 User Flow

1. Start by selecting your trip dates
2. Review suggested activities in the catalog popup
3. Drag cards into the planner board by day
4. Click cards to edit title, image, or move between days
5. All changes persist automatically in `localStorage`

---

## 💻 Getting Started

**Prerequisites**: Node.js v16+, npm

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

3. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Configure environment**
   - Create a `.env.local` at project root if you add any API keys (e.g. Google Maps).
   - For now, no API keys are required for the static MVP.

---

## 📦 Scripts

- `npm run dev` — start development server
- `npm run build` — compile for production
- `npm run start` — run production build locally
- `npm run lint` — run ESLint
- `npm run format` — run Prettier
- `npm run test` — run unit tests
- `npm run test:watch` — run tests in watch mode

---

## ☁️ Deployment

Deploy easily to **Vercel** or **Netlify**:

1. Push your code to GitHub.
2. Import the repository in your hosting service (https://vercel.com/new or https://app.netlify.com/start).
3. Set up any required environment variables.
4. Click "Deploy" — the platform will build and preview automatically.

_For detailed guides, see:_

- Next.js Deployment Docs: https://nextjs.org/docs/app/building-your-application/deploying
- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com/

---

## 🧠 What I Focused On

- Modular architecture with `/hooks`, `/lib`, and typed APIs
- Clean and maintainable drag‑and‑drop logic using `@dnd-kit`
- Custom components built on top of Radix UI primitives
- Local persistence using `localStorage`
- UX patterns: inline editing, optimistic updates, responsive layout
- Progressive structure ready to scale with real APIs

---

## 📜 License

This project is open-source under the [MIT License](LICENSE).
Feel free to reuse and adapt!

---

Built with 💙 by André Marinho  
Feel free to ⭐ this repo if you find it useful!
