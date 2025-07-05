# Turistar – AI-Powered Travel Planner

A personalized travel itinerary generator built with Next.js, React, and drag-and-drop. Enter your dates and interests, and get a smart daily plan you can tweak on the fly.

🔗 [Live Demo](https://travel-planner-orpin.vercel.app/)
*or* deploy easily to Vercel or Netlify with the same settings.

---

## Features

- **Dynamic Itineraries**
  Generate optimized day-by-day plans based on your destination and date range.
- **Interactive Drag-and-Drop**
  Rearrange activities across days or within the same day for fine-tuning.
- **Date Range Picker**
  Quickly adjust start/end dates with a responsive calendar widget.
- **Client-Side Rendering**
  Full interactivity via React hooks and DnD Kit, no server reloads needed.
- **Easy Deployment**
  Hosted on Vercel with zero-config builds and deploys.

---

## Tech Stack

- **Next.js 15** (App Router)
- **React** & **TypeScript**
- **@dnd-kit/core** & **@dnd-kit/sortable** for drag-and-drop
- **date-fns** for date manipulation
- **react-day-picker** for calendar UI
- **Vercel** for hosting

---

## Getting Started

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

## Scripts

- `npm run dev` — start development server  
- `npm run build` — compile for production  
- `npm run start` — run production build locally  
- `npm run lint` — run ESLint  
- `npm run format` — run Prettier

---

## Deployment

Deploy easily to Vercel:

1. Push your code to GitHub.  
2. Import the repository at https://vercel.com/new.  
3. Set up any required environment variables.  
4. Click “Deploy” — Vercel will handle builds and previews automatically.

_For detailed guides, see:_  
- Next.js Deployment Docs: https://nextjs.org/docs/app/building-your-application/deploying  
- Vercel Getting Started: https://vercel.com/docs

---

Built with 💙 by André Marinho  
Feel free to ⭐ this repo if you find it useful!
