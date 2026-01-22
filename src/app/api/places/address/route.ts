import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { fetchGeoapifyAddressAutocomplete } from "@/features/search/services/GeoapifyService";
import { validateGeoapifyQuery } from "@/shared/lib/server/geoapify/validateQuery";

export const runtime = "edge";
export const dynamic = "force-dynamic";

async function handleAddressAutocomplete(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const text = validateGeoapifyQuery(searchParams, "text");
  if (typeof text !== "string") {
    return text;
  }

  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  try {
    const results = await fetchGeoapifyAddressAutocomplete(
      text,
      lat && !Number.isNaN(Number(lat)) ? Number(lat) : undefined,
      lon && !Number.isNaN(Number(lon)) ? Number(lon) : undefined
    );
    return NextResponse.json({ results });
  } catch (err) {
    console.error("address autocomplete failed:", { text, lat, lon }, err);
    return NextResponse.json({ error: "Failed to load suggestions." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return handleAddressAutocomplete(req);
}
