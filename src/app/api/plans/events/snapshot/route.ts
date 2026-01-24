import { type NextRequest, NextResponse } from "next/server";

import { fetchSnapshot } from "@/features/snapshots/services/snapshotsQueries";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const planId = searchParams.get("planId")?.trim();

  if (!planId) {
    return NextResponse.json({ error: "Missing required parameter: planId" }, { status: 400 });
  }

  try {
    const snapshot = await fetchSnapshot(planId);
    return NextResponse.json({ snapshot });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to fetch plan snapshot." }, { status: 500 });
  }
}
