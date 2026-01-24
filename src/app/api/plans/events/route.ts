import { type NextRequest, NextResponse } from "next/server";

import { fetchEvents } from "@/features/events/services/eventsQueries";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const planId = searchParams.get("planId")?.trim();
  const sinceVersionRaw = searchParams.get("sinceVersion");

  if (!planId) {
    return NextResponse.json({ error: "Missing planId." }, { status: 400 });
  }

  const sinceVersion = Number(sinceVersionRaw);
  if (!Number.isFinite(sinceVersion)) {
    return NextResponse.json({ error: "Invalid sinceVersion." }, { status: 400 });
  }

  try {
    const events = await fetchEvents(planId, sinceVersion);
    return NextResponse.json({ events });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to fetch plan events." }, { status: 500 });
  }
}
