import type { NextRequest } from "next/server";
import { fetchGeoapifyPlaceSearch } from "@/features/search/services/GeoapifyService";
import { suggestionsResponse } from "../suggestions";

export const dynamic = "force-dynamic";
export const GET = (req: NextRequest) => suggestionsResponse(req, "name", fetchGeoapifyPlaceSearch);
