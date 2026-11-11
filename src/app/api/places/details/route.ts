import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getUnauthorizedResponse } from "@/app/api/routeAuth";
import { fetchGeoapifyPlaceDetails } from "@/features/search/services/GeoapifyService";
import { fetchWikidataImage } from "@/features/search/services/WikidataService";

export const dynamic = "force-dynamic";

async function handleLocalDetails(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const placeId = searchParams.get("placeId")?.trim();
  if (!placeId) {
    return NextResponse.json({ error: "Place ID is required." }, { status: 400 });
  }

  try {
    const details = await fetchGeoapifyPlaceDetails(placeId);
    const wikidataImageUrl = details.wikidataId ? await fetchWikidataImage(details.wikidataId) : undefined;
    return NextResponse.json({ details, wikidataImageUrl });
  } catch (error) {
    console.error("place details failed:", { hasPlaceId: Boolean(placeId) }, error);
    return NextResponse.json({ error: "Failed to load place details." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const unauthorizedResponse = await getUnauthorizedResponse();
  if (unauthorizedResponse) return unauthorizedResponse;

  return handleLocalDetails(req);
}
