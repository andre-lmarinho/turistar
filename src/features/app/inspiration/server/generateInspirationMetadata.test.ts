import { describe, it, expect, beforeEach, vi } from 'vitest';
import { notFound } from 'next/navigation';

import { generateInspirationMetadata } from './generateInspirationMetadata';

import { SITE_URL } from '@/shared/utils/siteUrl';
import {
  safeReadInspirationData,
  assertValidCitySlug,
} from '@/features/app/inspiration/server/inspirationData';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

vi.mock('@/features/app/inspiration/server/inspirationData', () => ({
  safeReadInspirationData: vi.fn(),
  assertValidCitySlug: vi.fn(),
}));

describe('generateInspirationMetadata', () => {
  const notFoundError = new Error('NOT_FOUND');

  beforeEach(() => {
    vi.mocked(notFound).mockImplementation(() => {
      throw notFoundError;
    });
    vi.mocked(assertValidCitySlug).mockReset();
    vi.mocked(safeReadInspirationData).mockReset();
  });

  it('delegates to notFound when the slug is invalid', async () => {
    vi.mocked(assertValidCitySlug).mockImplementation(() => notFound());

    await expect(generateInspirationMetadata('Invalid!')).rejects.toBe(notFoundError);
    expect(safeReadInspirationData).not.toHaveBeenCalled();
  });

  it('delegates to notFound when the inspiration document is missing', async () => {
    vi.mocked(assertValidCitySlug).mockImplementation(() => undefined);
    vi.mocked(safeReadInspirationData).mockImplementation(() => notFound());

    await expect(generateInspirationMetadata('lisbon')).rejects.toBe(notFoundError);
    expect(safeReadInspirationData).toHaveBeenCalledWith('lisbon');
  });

  it('uses defaults when description and images are absent', async () => {
    const city = 'lisbon';
    const defaultDescription = `Plan a trip to Lisbon with suggested activities, map, and budget tracking.`;
    vi.mocked(assertValidCitySlug).mockImplementation(() => undefined);
    vi.mocked(safeReadInspirationData).mockResolvedValue({
      slug: city,
      destination: 'Lisbon',
      itinerary: [],
      description: undefined,
      title: undefined,
    });

    const metadata = await generateInspirationMetadata(city);
    const fallbackImage = `${SITE_URL}/previews/preview_01.png`;

    expect(metadata.title).toBe('Lisbon Inspiration');
    expect(metadata.description).toBe(defaultDescription);
    expect(metadata.openGraph?.title).toBe('Lisbon Inspiration');
    expect(metadata.openGraph?.description).toBe(defaultDescription);
    expect(metadata.twitter?.title).toBe('Lisbon Inspiration');
    expect(metadata.twitter?.description).toBe(defaultDescription);
    const openGraphImages = metadata.openGraph?.images as { url: string }[] | undefined;
    expect(openGraphImages?.[0]?.url).toBe(fallbackImage);
    expect(metadata.twitter?.images).toEqual([fallbackImage]);
  });

  it('applies custom metadata and uses an absolute image URL', async () => {
    const city = 'lisbon';
    const custom = {
      slug: city,
      destination: 'Lisbon',
      description: 'Custom description',
      title: 'Lisbon Guide',
      itinerary: [
        {
          day: 1,
          activities: [
            {
              title: 'Wake up',
              startTime: '09:00',
              duration: 60,
              address: 'Lisbon',
              imageUrl: 'https://example.com/hero.png',
            },
          ],
        },
      ],
    };
    vi.mocked(assertValidCitySlug).mockImplementation(() => undefined);
    vi.mocked(safeReadInspirationData).mockResolvedValue(custom);

    const metadata = await generateInspirationMetadata(city);

    expect(metadata.title).toBe('Lisbon Guide');
    expect(metadata.description).toBe('Custom description');
    expect(metadata.openGraph?.title).toBe('Lisbon Guide');
    expect(metadata.openGraph?.description).toBe('Custom description');
    expect(metadata.twitter?.title).toBe('Lisbon Guide');
    expect(metadata.twitter?.description).toBe('Custom description');
    const openGraphImages = metadata.openGraph?.images as { url: string }[] | undefined;
    expect(openGraphImages?.[0]?.url).toBe('https://example.com/hero.png');
    expect(metadata.twitter?.images).toEqual(['https://example.com/hero.png']);
  });

  it('converts relative image paths using SITE_URL', async () => {
    const city = 'lisbon';
    vi.mocked(assertValidCitySlug).mockImplementation(() => undefined);
    vi.mocked(safeReadInspirationData).mockResolvedValue({
      slug: city,
      destination: 'Lisbon',
      description: undefined,
      title: undefined,
      itinerary: [
        {
          day: 1,
          activities: [
            {
              title: 'Walk',
              startTime: '10:00',
              duration: 30,
              address: 'Lisbon',
              imageUrl: 'images/local.png',
            },
          ],
        },
      ],
    });

    const metadata = await generateInspirationMetadata(city);
    const expectedUrl = new URL('images/local.png', SITE_URL).toString();
    const openGraphImages = metadata.openGraph?.images as { url: string }[] | undefined;

    expect(openGraphImages?.[0]?.url).toBe(expectedUrl);
    expect(metadata.twitter?.images).toEqual([expectedUrl]);
  });
});
