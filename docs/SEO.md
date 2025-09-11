# SEO Setup

This project uses Next.js Metadata API and app routes to provide basic SEO out of the box.

## What’s included

- Global metadata in `src/app/layout.tsx` (title, description, Open Graph, Twitter card, icons, robots)
- Page metadata for the planner in `src/app/planner/page.tsx`
- JSON‑LD Organization and WebSite via `src/shared/components/SeoJsonLd.tsx`
- BreadcrumbList and TouristAttraction JSON‑LD on inspiration pages via `src/features/inspiration/components/BreadcrumbLd.tsx`
- Dynamic `robots.txt` at `src/app/robots.ts` (noindex on non‑production)
- Dynamic `sitemap.xml` at `src/app/sitemap.ts` (includes `/`, `/planner`, and inspiration demo pages)

## Configuration

- Site URL is defined in `src/shared/constants/site.ts` as a constant (no env required). Update it if the domain changes.
- Default preview image: `/previews/preview_01.png` in `public/`.

## Extending

- Add page‑level metadata with `export const metadata` or `generateMetadata` in individual page files.
- Add structured data per page (e.g., `BreadcrumbList`, `TouristAttraction`) with small components similar to `SeoJsonLd`.
- Add any additional static routes to `src/app/sitemap.ts` as needed.

## Local vs Production

- `robots.ts` allows indexing when the configured site URL is not localhost. Since the site URL is a constant, it will allow indexing for the production domain and dev servers will not be crawled.
