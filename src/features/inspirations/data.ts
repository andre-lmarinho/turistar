export interface InspirationSummary {
  slug: string;
  title: string;
  image: string;
  featured: boolean;
}

export const INSPIRATIONS: InspirationSummary[] = [
  {
    slug: "rome",
    title: "A 4 day trip to Rome",
    image: "/inspiration/rome/preview.jpg",
    featured: true,
  },
  {
    slug: "boipeba",
    title: "A weekend in Boipeba",
    image: "/inspiration/boipeba/preview.jpg",
    featured: true,
  },
  {
    slug: "paris",
    title: "A weekend in Paris",
    image: "/inspiration/paris/preview.jpg",
    featured: false,
  },
];

export const INSPIRATION_SLUGS = INSPIRATIONS.map((i) => i.slug);

export function getAllInspirations(): InspirationSummary[] {
  return INSPIRATIONS;
}

export function getMarketingInspirations(): InspirationSummary[] {
  return INSPIRATIONS.filter((i) => i.featured);
}
