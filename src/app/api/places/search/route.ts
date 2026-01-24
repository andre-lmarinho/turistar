import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { fetchGeoapifyPlaceSearch } from "@/features/search/services/GeoapifyService";
import { validateGeoapifyQuery } from "@/shared/lib/server/geoapify/validateQuery";

export const runtime = "edge";
export const dynamic = "force-dynamic";

async function handleLocalSearch(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = validateGeoapifyQuery(searchParams, "name");
  if (typeof name !== "string") {
    return name;
  }

  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  try {
    const results = await fetchGeoapifyPlaceSearch(
      name,
      lat && !Number.isNaN(Number(lat)) ? Number(lat) : undefined,
      lon && !Number.isNaN(Number(lon)) ? Number(lon) : undefined
    );
    return NextResponse.json({ results });
  } catch (error) {
    console.error("place search failed:", { name, lat, lon }, error);
    return NextResponse.json({ error: "Failed to search places." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return handleLocalSearch(req);
}
