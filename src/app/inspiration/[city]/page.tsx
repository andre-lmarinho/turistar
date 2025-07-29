// src/app/inspiration/[city]/page.tsx
export const dynamic = 'force-dynamic'; // disable SSG and ISR

import { readFileSync } from 'fs';
import { join } from 'path';
import type { Metadata } from 'next';
import type { PageProps } from './$types';
import InspirationPlanner from '../InspirationPlanner';
import { buildDaysFromInspirationData } from '@/utils';

export interface InspirationPageProps extends PageProps {}
export async function generateMetadata({ params }: InspirationPageProps): Promise<Metadata> {
  const { city } = params;
  return { title: `${city} Inspiration` };
}

export default function InspirationPage({ params }: InspirationPageProps) {
  const { city } = params;
  const filePath = join(process.cwd(), 'src', 'data', `${city}.json`);
  const raw = readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);
  console.log('[InspirationPage] Loaded JSON:', data);

  const initialDays = buildDaysFromInspirationData(data);

  return (
    <InspirationPlanner initialDays={initialDays} dest={city} planId={`${city}-inspiration`} />
  );
}
