// src/app/inspiration/[city]/page.tsx
export const dynamic = 'force-dynamic'; // disable SSG/ISR

import { promises as fs } from 'fs';
import { join } from 'path';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import InspirationPlanner from '../InspirationPlanner';
import { buildDaysFromInspirationData, type InspirationData } from '@/utils';

type CityParams = { city: string };

function isValidSlug(slug: string) {
  return /^[a-z0-9-]+$/.test(slug);
}

async function loadInspirationJSON(city: string): Promise<InspirationData> {
  const filePath = join(process.cwd(), 'src', 'data', `${city}.json`);
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw) as InspirationData;
}

/* <head> metadata */
export async function generateMetadata({
  params,
}: {
  params: CityParams | Promise<CityParams>;
}): Promise<Metadata> {
  const { city } = await params;
  return { title: `${city} Inspiration` };
}

/* page component */
export default async function InspirationPage({
  params,
}: {
  params: CityParams | Promise<CityParams>;
}) {
  const { city } = await params;

  if (!isValidSlug(city)) notFound();

  let data: InspirationData;
  try {
    data = await loadInspirationJSON(city);
  } catch {
    notFound();
  }

  const initialDays = buildDaysFromInspirationData(data);

  return (
    <InspirationPlanner initialDays={initialDays} dest={city} planId={`${city}-inspiration`} />
  );
}
