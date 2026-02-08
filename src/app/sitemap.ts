import { promises as fs } from "node:fs";
import { join } from "node:path";
import type { MetadataRoute } from "next";

import { SITE_URL } from "@/shared/utils/siteUrl";

const MARKETING_ROUTES = [
  "/",
  "/friends",
  "/planning",
  "/planning/adventure",
  "/planning/digital-nomad",
  "/planning/event-based",
  "/planning/family",
  "/planning/road-trip",
  "/planning/vacation",
  "/privacy",
  "/terms",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const routes: MetadataRoute.Sitemap = MARKETING_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.8,
  }));

  // Add inspiration routes based on available demo data JSON files
  try {
    const dataDir = join(process.cwd(), "src", "features", "inspirations", "destinations");
    const files = await fs.readdir(dataDir);
    for (const f of files) {
      if (f.endsWith(".json")) {
        const city = f.replace(/\.json$/, "");
        routes.push({
          url: `${SITE_URL}/p/inspiration/${city}`,
          lastModified: now,
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    }
  } catch (err) {
    if (typeof err === "object" && err !== null && "code" in err && err.code === "ENOENT") {
      // no-op if data dir not present
      return routes;
    }

    const details = err instanceof Error ? err.message : String(err);
    console.warn(`[sitemap] Failed to read inspiration routes: ${details}`);
  }

  return routes;
}
