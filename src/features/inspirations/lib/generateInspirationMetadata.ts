import type { Metadata } from "next";

import { loadInspirationBySlug } from "@/features/inspirations/lib/inspirationLoader";

import { capitalize } from "@/shared/utils/capitalize";
import { SITE_URL } from "@/shared/utils/siteUrl";

export async function generateInspirationMetadata(city: string): Promise<Metadata> {
  const cityName = capitalize(city);
  const baseTitle = `${cityName} Inspiration`;
  const pageUrl = `${SITE_URL}/p/inspiration/${city}`;
  const defaultDescription = `Plan a trip to ${cityName} with suggested activities, map, and budget tracking.`;

  const data = await loadInspirationBySlug(city);
  const description = data.description?.trim();
  const title = description ? (data.title ?? baseTitle) : baseTitle;
  const finalDescription = description ?? defaultDescription;

  const firstWithImage = data.itinerary
    ?.flatMap((day) => day.activities ?? [])
    .find((activity) => activity.imageUrl)?.imageUrl;
  const ogImage = firstWithImage
    ? firstWithImage.startsWith("http")
      ? firstWithImage
      : new URL(firstWithImage, SITE_URL).toString()
    : new URL("/previews/preview_01.png", SITE_URL).toString();

  return {
    title,
    description: finalDescription,
    alternates: { canonical: pageUrl },
    openGraph: {
      type: "article",
      url: pageUrl,
      siteName: "Turistar",
      title,
      description: finalDescription,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${baseTitle} preview`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: finalDescription,
      images: [ogImage],
    },
    keywords: [cityName, "travel planner", "itinerary", "budget travel", "map"],
  };
}
