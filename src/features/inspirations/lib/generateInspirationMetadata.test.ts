import { beforeEach, describe, expect, it, vi } from "vitest";

import { loadInspirationBySlug } from "@/features/inspirations/lib/inspirationLoader";
import { SITE_URL } from "@/shared/utils/siteUrl";

import { generateInspirationMetadata } from "./generateInspirationMetadata";

vi.mock("@/features/inspirations/lib/inspirationLoader", () => ({
  loadInspirationBySlug: vi.fn(),
}));

describe("generateInspirationMetadata", () => {
  const notFoundError = new Error("NOT_FOUND");

  beforeEach(() => {
    vi.mocked(loadInspirationBySlug).mockReset();
  });

  it("propagates error when loadInspirationBySlug throws", async () => {
    vi.mocked(loadInspirationBySlug).mockImplementation(() => {
      throw notFoundError;
    });

    await expect(generateInspirationMetadata("invalid")).rejects.toBe(notFoundError);
    expect(loadInspirationBySlug).toHaveBeenCalledWith("invalid");
  });

  it("uses defaults when description and images are absent", async () => {
    const city = "lisbon";
    const defaultDescription = `Plan a trip to Lisbon with suggested activities, map, and budget tracking.`;
    vi.mocked(loadInspirationBySlug).mockResolvedValue({
      destination: "Lisbon",
      itinerary: [],
      description: undefined,
      title: undefined,
    });

    const metadata = await generateInspirationMetadata(city);
    const fallbackImage = `${SITE_URL}/previews/preview_01.png`;

    expect(metadata.title).toBe("Lisbon Inspiration");
    expect(metadata.description).toBe(defaultDescription);
    expect(metadata.openGraph?.title).toBe("Lisbon Inspiration");
    expect(metadata.openGraph?.description).toBe(defaultDescription);
    expect(metadata.twitter?.title).toBe("Lisbon Inspiration");
    expect(metadata.twitter?.description).toBe(defaultDescription);
    const openGraphImages = metadata.openGraph?.images as { url: string }[] | undefined;
    expect(openGraphImages?.[0]?.url).toBe(fallbackImage);
    expect(metadata.twitter?.images).toEqual([fallbackImage]);
  });

  it("applies custom metadata and uses an absolute image URL", async () => {
    const city = "lisbon";
    const custom = {
      destination: "Lisbon",
      description: "Custom description",
      title: "Lisbon Guide",
      itinerary: [
        {
          activities: [
            {
              title: "Wake up",
              startTime: "09:00",
              duration: 60,
              address: "Lisbon",
              imageUrl: "https://example.com/hero.png",
            },
          ],
        },
      ],
    };
    vi.mocked(loadInspirationBySlug).mockResolvedValue(custom);

    const metadata = await generateInspirationMetadata(city);

    expect(metadata.title).toBe("Lisbon Guide");
    expect(metadata.description).toBe("Custom description");
    expect(metadata.openGraph?.title).toBe("Lisbon Guide");
    expect(metadata.openGraph?.description).toBe("Custom description");
    expect(metadata.twitter?.title).toBe("Lisbon Guide");
    expect(metadata.twitter?.description).toBe("Custom description");
    const openGraphImages = metadata.openGraph?.images as { url: string }[] | undefined;
    expect(openGraphImages?.[0]?.url).toBe("https://example.com/hero.png");
    expect(metadata.twitter?.images).toEqual(["https://example.com/hero.png"]);
  });

  it("converts relative image paths using SITE_URL", async () => {
    const city = "lisbon";
    vi.mocked(loadInspirationBySlug).mockResolvedValue({
      destination: "Lisbon",
      description: undefined,
      title: undefined,
      itinerary: [
        {
          activities: [
            {
              title: "Walk",
              startTime: "10:00",
              duration: 30,
              address: "Lisbon",
              imageUrl: "images/local.png",
            },
          ],
        },
      ],
    });

    const metadata = await generateInspirationMetadata(city);
    const expectedUrl = new URL("images/local.png", SITE_URL).toString();
    const openGraphImages = metadata.openGraph?.images as { url: string }[] | undefined;

    expect(openGraphImages?.[0]?.url).toBe(expectedUrl);
    expect(metadata.twitter?.images).toEqual([expectedUrl]);
  });
});
