// src/app/inspiration/[city]/page.tsx
export const dynamic = 'force-dynamic'; // desabilita SSG e ISR

import { readFileSync } from 'fs';
import { join } from 'path';
import type { Metadata } from 'next';
import InspirationPlanner from '../InspirationPlanner';
import { buildDaysFromInspirationData } from '@/utils';

type Props = {
  params: { city: string };
};

export async function generateMetadata({ params: { city } }: Props): Promise<Metadata> {
  return { title: `${city} Inspiration` };
}

export default async function InspirationPage({ params: { city } }: Props) {
  const filePath = join(process.cwd(), 'src', 'data', `${city}.json`);
  const raw = readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);
  console.log('[InspirationPage] JSON carregado:', data);

  const initialDays = buildDaysFromInspirationData(data);

  return (
    <InspirationPlanner initialDays={initialDays} dest={city} planId={`${city}-inspiration`} />
  );
}
