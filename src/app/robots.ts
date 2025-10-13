import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/shared/utils/siteUrl';
const isProd = !/localhost|127\.0\.0\.1/.test(SITE_URL);

export default function robots(): MetadataRoute.Robots {
  // Disallow indexing on non-production deployments by default
  return {
    rules: [
      {
        userAgent: '*',
        allow: isProd ? '/' : '',
        disallow: isProd ? undefined : '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
