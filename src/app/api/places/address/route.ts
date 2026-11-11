import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getUnauthorizedResponse } from "@/app/api/routeAuth";
import {
  fetchGeoapifyAddressAutocomplete,
  readGeoapifyCoordinates,
  validateGeoapifyQuery,
} from "@/features/search/services/GeoapifyService";

export const dynamic = "force-dynamic";

async function handleAddressAutocomplete(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const text = validateGeoapifyQuery(searchParams, "text");
  if (typeof text !== "string") {
    return text;
  }

  const { lat, lon } = readGeoapifyCoordinates(searchParams);

  try {
    const results = await fetchGeoapifyAddressAutocomplete(text, lat, lon);
    return NextResponse.json({ results });
  } catch (err) {
    console.error("address autocomplete failed:", { hasCoordinates: lat != null && lon != null }, err);
    return NextResponse.json({ error: "Failed to load suggestions." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const unauthorizedResponse = await getUnauthorizedResponse();
  if (unauthorizedResponse) return unauthorizedResponse;

  return handleAddressAutocomplete(req);
}
