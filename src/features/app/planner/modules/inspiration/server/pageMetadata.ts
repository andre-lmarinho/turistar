import type { Metadata } from 'next';

import { generateInspirationMetadata } from './generateInspirationMetadata';

type CityParams = { city: string };

export async function inspirationPageMetadata({
  params,
}: {
  params: Promise<CityParams>;
}): Promise<Metadata> {
  const { city } = await params;
  return generateInspirationMetadata(city);
}
