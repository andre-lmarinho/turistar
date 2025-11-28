import type { InspirationDocument } from './server/types';
import boipeba from './data/boipeba.json';
import paris from './data/paris.json';
import rome from './data/rome.json';

export type InspirationItem = {
  slug: string;
  title: string;
  tag?: string;
  image?: string;
};

export const INSPIRATION_DOCUMENTS: InspirationDocument[] = [rome, boipeba, paris].map(
  (doc) => doc as InspirationDocument
);

export const INSPIRATION_SLUGS = INSPIRATION_DOCUMENTS.map((doc) => doc.slug);

export function getInspirationDocumentBySlug(slug: string): InspirationDocument | undefined {
  return INSPIRATION_DOCUMENTS.find((doc) => doc.slug === slug);
}

const ALL_ITEMS: InspirationItem[] = INSPIRATION_DOCUMENTS.map((item) => ({
  slug: item.slug,
  title: item.title_inspiration ?? item.title ?? item.slug,
  tag: item.tag,
  image: item.image,
}));

export function getAllInspirationItems(): InspirationItem[] {
  return ALL_ITEMS;
}

export function getMarketingInspirationItems(): InspirationItem[] {
  // Marketing only highlights a couple of templates.
  return ALL_ITEMS.filter((item) => item.slug === 'rome' || item.slug === 'boipeba');
}
