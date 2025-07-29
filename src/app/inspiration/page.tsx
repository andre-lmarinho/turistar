// src/app/inspiration/[city]/page.tsx

import type { Metadata } from 'next';
import InspirationPlanner from './InspirationPlanner';
import { buildDaysFromInspirationData } from '@/utils';

export async function generateMetadata({
  params,
}: {
  params: { city: string };
}): Promise<Metadata> {
  const city = params.city.charAt(0).toUpperCase() + params.city.slice(1);
  return { title: `${city} Inspiration` };
}

export default async function InspirationPage({ params }: { params: { city: string } }) {
  const { city } = params;
  const mod = await import(`@/data/${city}.json`);
  const initialDays = buildDaysFromInspirationData(mod.default);
  return (
    <InspirationPlanner initialDays={initialDays} dest={city} planId={`${city}-inspiration`} />
  );
}
