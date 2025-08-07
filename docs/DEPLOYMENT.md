# Deployment Guide

This document covers how to deploy **Turistar** and manage environment variables and offline data.

## Environment Variables

Copy `.env.example` to `.env.local` and set the following values:

- `GEOAPIFY_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

These variables should also be configured in your hosting provider's environment settings (e.g., Vercel or Netlify) so production builds can access them.

See [Environment](ENVIRONMENT.md) for how these variables are validated and how authentication works.

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

## Catalog API Key

Set the `GEOAPIFY_KEY` environment variable in your hosting platform so the catalog endpoint can request data from Geoapify.
