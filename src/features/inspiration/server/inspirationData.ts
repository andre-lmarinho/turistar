// src/features/inspiration/server/inspirationData.ts
import { promises as fs } from 'fs';
import { join } from 'path';
import { notFound } from 'next/navigation';
import type { InspirationDocument } from './types';

const DATA_DIR = join(process.cwd(), 'src', 'features', 'inspiration', 'data');
const CITY_SLUG_REGEX = /^[a-z0-9-]+$/;

export function assertValidCitySlug(city: string) {
  if (!CITY_SLUG_REGEX.test(city)) {
    notFound();
  }
}

export async function readInspirationData(city: string): Promise<InspirationDocument> {
  const filePath = join(DATA_DIR, `${city}.json`);
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw) as InspirationDocument;
}

export async function safeReadInspirationData(city: string): Promise<InspirationDocument> {
  try {
    return await readInspirationData(city);
  } catch {
    notFound();
  }
}
