# SEO Setup

This project uses Next.js Metadata API and app routes to provide basic SEO out of the box.

## What’s included

- Global metadata in `src/app/layout.tsx` (title, description, Open Graph, Twitter card, icons, robots)
- JSON‑LD Organization and WebSite via `src/shared/components/SeoJsonLd.tsx`
- Dynamic `robots.txt` at `src/app/robots.ts` (noindex on non‑production)
- Dynamic `sitemap.xml` at `src/app/sitemap.ts` (includes `/`, `/planner`, and inspiration demo pages)

## Configuration

- Site URL is resolved at runtime via `SITE_URL` from `src/shared/constants/site.ts`.
  - Local dev: auto-falls back to `http://localhost:3000`.
  - Vercel: uses `VERCEL_URL` and prepends `https://`.
  - Custom domains: optionally set `NEXT_PUBLIC_SITE_URL` to a full origin (no trailing slash) in your environment.
- Default preview image: `/previews/preview_01.png` in `public/`.

## Extending

- Add page‑level metadata with `export const metadata` or `generateMetadata` in individual page files.
- Add structured data per page (e.g., `BreadcrumbList`, `TouristAttraction`) with small components similar to `SeoJsonLd`.
- Add any additional static routes to `src/app/sitemap.ts` as needed.

## Local vs Production

- `robots.ts` allows indexing when the resolved site URL is not localhost. Production deployments are indexed; dev servers are disallowed by default.
