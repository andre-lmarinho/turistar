import type { Metadata } from "next";

import { generateInspirationMetadata } from "@/features/inspirations/lib/generateInspirationMetadata";

type CityParams = { city: string };

export async function inspirationPageMetadata({
  params,
}: {
  params: Promise<CityParams>;
}): Promise<Metadata> {
  const { city } = await params;
  return generateInspirationMetadata(city);
}
