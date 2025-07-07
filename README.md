# Turistar – Drag-and-Drop Travel Planner

A simple itinerary planner built with Next.js, React and drag‑and‑drop. Select your travel dates and destination to generate a starter plan (from a local JSON API) that you can rearrange and edit as you like. Plans are saved to `localStorage` so they stick around between visits.

🔗 [Live Demo](https://travel-planner-orpin.vercel.app/)
_or_ deploy easily to Vercel or Netlify with the same settings.

---

## 🚀 Key Features

- **Welcome Form**
  Choose your destination and date range to start a new trip.
- **Planner Board**
  Drag activities between days or add blank cards to build your schedule.
- **Catalog Popup**
  Browse suggested activities and insert them directly into the board.
- **Local Data Mock**
  Demo itinerary comes from `/api/itinerary`, which serves a static JSON file.
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

---

## 📖 How It Works

1. **Welcome Form** – Home page asks for your destination and trip dates.
2. **Planner Board** – One column per day with drag‑and‑drop cards.
3. **Catalog Popup** – Add activities from a local JSON mock using the “Open Panel” button.
4. **Edit & Reorder** – Click a card to edit or drag between days.
5. **Local Storage** – Your plan persists in the browser across refreshes.

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

## 📜 License

This project is open-source under the [MIT License](LICENSE).
Feel free to reuse and adapt!

---

Built with 💙 by André Marinho  
Feel free to ⭐ this repo if you find it useful!
