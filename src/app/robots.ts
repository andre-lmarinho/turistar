import type { MetadataRoute } from "next";
import { SITE_URL } from "@/shared/utils/siteUrl";

const isProduction = process.env.VERCEL_ENV === "production";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: isProduction ? undefined : "/",
        disallow: isProduction ? "/" : undefined,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
