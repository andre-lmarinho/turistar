# Deployment Guide

This document covers how to deploy **Turistar** and manage environment variables and offline data.

## Environment Variables

Copy `.env.example` to `.env.local` and set the following values:

- `NEXT_PUBLIC_GEOAPIFY_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VERCEL_TOKEN` (only required for non-interactive CLI usage, e.g. CI)

These variables should also be configured in your hosting provider's environment settings (e.g., Vercel or Netlify) so production builds can access them. For CI workflows that run `vercel pull`/`vercel build`, expose `VERCEL_TOKEN` as a repository secret.

See [Developer Guide](DEVELOPER_GUIDE.md#environment) for how these variables are validated and how authentication works.

## Build & Hosting

1. Install dependencies and build the project:

   ```bash
   npm install
   npm run build
   ```

2. Deploy to **Vercel** or another platform. On Vercel, every push creates a preview deployment. Merging to `main` updates production automatically.

CI runs an isolated Vercel build for verification using `vercel pull --environment=preview` and `vercel build`, and uploads `.vercel/output` as a build artifact for inspection.

You can also run the production build locally with:

```bash
npm start
```
