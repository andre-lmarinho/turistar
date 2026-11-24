import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getUnauthorizedResponse } from "@/app/api/routeAuth";
import { readGeoapifyCoordinates, validateGeoapifyQuery } from "@/features/search/services/GeoapifyService";
import type { AutocompletePlace } from "@/features/search/types";

export async function suggestionsResponse(
  req: NextRequest,
  param: "text" | "name",
  search: (text: string, lat?: number, lon?: number) => Promise<AutocompletePlace[]>
) {
  const unauthorized = await getUnauthorizedResponse();
  if (unauthorized) return unauthorized;
  const url = new URL(req.url);
  const text = validateGeoapifyQuery(url.searchParams, param);
  if (typeof text !== "string") return text;
  const { lat, lon } = readGeoapifyCoordinates(url.searchParams);
  try {
    return NextResponse.json({ results: await search(text, lat, lon) });
  } catch (error) {
    console.error(
      "Place suggestions failed",
      { path: url.pathname, hasCoordinates: lat != null && lon != null },
      error
    );
    return NextResponse.json(
      { error: param === "name" ? "Failed to search places." : "Failed to load suggestions." },
      { status: 500 }
    );
  }
}
