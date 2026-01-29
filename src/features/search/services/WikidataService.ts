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

    return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=${width}`;
  } catch (error) {
    console.error(`Failed to fetch Wikidata image for ${entityId}`, error);
    return undefined;
  }
}
