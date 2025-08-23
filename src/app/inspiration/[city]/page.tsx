// src/app/inspiration/[city]/page.tsx
export const dynamic = 'force-dynamic';

import { promises as fs } from 'fs';
import { join } from 'path';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import InspirationPlanner from '../InspirationPlanner';
import { buildDaysFromInspirationData, type InspirationData } from '@/features/planner/services';
import { capitalize } from '@/shared/utils';

type CityParams = { city: string };

/* <head> metadata */
export async function generateMetadata({
  params,
}: {
  params: Promise<CityParams>;
}): Promise<Metadata> {
  const { city } = await params;
  return { title: `${capitalize(city)} Inspiration` };
}

/* page component */
export default async function InspirationPage({ params }: { params: Promise<CityParams> }) {
  const { city } = await params;

  if (!/^[a-z0-9-]+$/.test(city)) notFound();

  try {
    const filePath = join(process.cwd(), 'src', 'data', `${city}.json`);
    const raw = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(raw) as InspirationData;

    const initialDays = buildDaysFromInspirationData(data);
    const initialBudget = data.budget?.amount ?? 0;
    const initialEntries = (data.expenses ?? []).map((e, i) => ({
      id: `exp-${i}`,
      ...e,
    }));

    return (
      <InspirationPlanner
        initialDays={initialDays}
        dest={city}
        planId={`${city}-inspiration`}
        initialBudget={initialBudget}
        initialEntries={initialEntries}
      />
    );
  } catch {
    notFound();
  }
}
