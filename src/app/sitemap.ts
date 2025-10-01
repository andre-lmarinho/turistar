// src/app/sitemap.ts
import type { MetadataRoute } from 'next';
import { promises as fs } from 'fs';
import { join } from 'path';
import { SITE_URL } from '@/shared/constants/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    {
      url: `${SITE_URL}/planner`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Add inspiration routes based on available demo data JSON files
  try {
    const dataDir = join(process.cwd(), 'src', 'features', 'inspiration', 'data');
    const files = await fs.readdir(dataDir);
    for (const f of files) {
      if (f.endsWith('.json')) {
        const city = f.replace(/\.json$/, '');
        routes.push({
          url: `${SITE_URL}/inspiration/${city}`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      }
    }
  } catch {
    // no-op if data dir not present
  }

  return routes;
}
