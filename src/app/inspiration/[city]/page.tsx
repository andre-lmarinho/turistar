// src/app/inspiration/[city]/page.tsx

import type { Metadata } from 'next';
import InspirationPlanner from '../InspirationPlanner';
import { buildDaysFromInspirationData } from '@/utils';

type Props = {
  params: {
    city: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  return {
    title: `${city} Inspiration`,
  };
}

export default async function InspirationPage({ params }: Props) {
  const { city } = await params;
  const mod = await import(`@/data/${city}.json`);
  const initialDays = buildDaysFromInspirationData(mod.default);

  return (
    <InspirationPlanner initialDays={initialDays} dest={city} planId={`${city}-inspiration`} />
  );
}
