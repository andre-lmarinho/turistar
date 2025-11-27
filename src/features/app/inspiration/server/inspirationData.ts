import { notFound } from 'next/navigation';
import type { InspirationDocument } from './types';
import { INSPIRATION_SLUGS, getInspirationDocumentBySlug } from '../data';

const CITY_SLUG_REGEX = /^[a-z0-9-]+$/;

type CitySlug = (typeof INSPIRATION_SLUGS)[number];

function isValidCitySlug(city: string): city is CitySlug {
  return CITY_SLUG_REGEX.test(city) && INSPIRATION_SLUGS.includes(city as CitySlug);
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

  const doc = getInspirationDocumentBySlug(city);
  if (!doc) {
    notFound();
  }

  return doc;
}
