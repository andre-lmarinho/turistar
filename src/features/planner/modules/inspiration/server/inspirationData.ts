import { notFound } from 'next/navigation';
import type { InspirationDocument } from './types';
import boipeba from '../data/boipeba.json';
import rome from '../data/rome.json';

const CITY_SLUG_REGEX = /^[a-z0-9-]+$/;

const CITY_DOCUMENTS = {
  boipeba: boipeba as InspirationDocument,
  rome: rome as InspirationDocument,
} as const;

type CitySlug = keyof typeof CITY_DOCUMENTS;

const CITY_SLUGS = Object.keys(CITY_DOCUMENTS) as CitySlug[];

function isValidCitySlug(city: string): city is CitySlug {
  return CITY_SLUG_REGEX.test(city) && CITY_SLUGS.includes(city as CitySlug);
}

export function assertValidCitySlug(city: string) {
  if (!isValidCitySlug(city)) {
    notFound();
  }
}

export async function safeReadInspirationData(city: string): Promise<InspirationDocument> {
  if (!isValidCitySlug(city)) {
    notFound();
  }

  return CITY_DOCUMENTS[city];
}
