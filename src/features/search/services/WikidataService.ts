import "server-only";

import { WIKIDATA_IMAGE_WIDTH } from "../config";

type WikidataEntityResponse = {
  entities?: Record<
    string,
    {
      claims?: {
        P18?: Array<{
          mainsnak?: {
            datavalue?: {
              value?: string;
            };
          };
        }>;
      };
    }
  >;
};

export async function fetchWikidataImage(
  entityId: string,
  signal?: AbortSignal,
  width: number = WIKIDATA_IMAGE_WIDTH
): Promise<string | undefined> {
  if (!entityId) return undefined;

  // Validate width parameter to prevent injection attacks
  const MAX_IMAGE_WIDTH = 2000;
  const sanitizedWidth =
    Number.isInteger(width) && width > 0 && width <= MAX_IMAGE_WIDTH ? width : WIKIDATA_IMAGE_WIDTH;

  const url = `https://www.wikidata.org/wiki/Special:EntityData/${entityId}.json`;

  try {
    const res = await fetch(url, { signal });
    if (!res.ok) {
      return undefined;
    }

    const data = (await res.json()) as WikidataEntityResponse;
    const entity = data.entities?.[entityId];
    const claims = entity?.claims?.P18 ?? [];
    const fileName = claims.find((claim) => claim.mainsnak?.datavalue?.value)?.mainsnak?.datavalue?.value;

    if (!fileName) return undefined;

    return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=${sanitizedWidth}`;
  } catch (error) {
    console.error(`Failed to fetch Wikidata image for ${entityId}`, error);
    return undefined;
  }
}
