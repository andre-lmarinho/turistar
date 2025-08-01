# Deployment Guide

This document covers how to deploy **Turistar** and manage environment variables and offline data.

## Environment Variables

The current version does not require any custom variables. If you integrate external services, create a `.env.local` file in the project root and add your keys there. Variables prefixed with `NEXT_PUBLIC_` will be exposed to the browser.

Example:

```bash
MAPS_API_KEY=your-key-here
NEXT_PUBLIC_ANALYTICS_ID=abcd
```

## Build & Hosting

1. Install dependencies and build the project:

   ```bash
   npm install
   npm run build
   ```

2. Deploy to **Vercel** or another platform. On Vercel, every push creates a preview deployment. Merging to `main` updates production automatically.

You can also run the production build locally with:

```bash
npm start
```

## Offline Data Versioning

Demo activities are stored under `src/data`. When the JSON files change, increment a version number in your codebase to invalidate any cached planner data in `localStorage`. A simple approach is to store the version with each plan key and clear outdated entries when the version changes.
