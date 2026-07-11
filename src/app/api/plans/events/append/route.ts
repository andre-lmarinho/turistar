import { NextResponse } from "next/server";

import { appendEvents } from "@/features/events/services/eventsQueries";
import type { EventInsert } from "@/features/events/types";
import { getCurrentUser } from "@/shared/lib/auth/session";

type AppendBody = {
  planId?: string;
  baseVersion?: number;
  events?: EventInsert[];
};

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let payload: AppendBody;
  try {
    payload = (await request.json()) as AppendBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const planId = typeof payload.planId === "string" ? payload.planId.trim() : "";
  if (!planId) {
    return NextResponse.json({ error: "Missing planId." }, { status: 400 });
  }

  if (!Number.isFinite(payload.baseVersion)) {
    return NextResponse.json({ error: "Invalid baseVersion." }, { status: 400 });
  }

  if (!Array.isArray(payload.events)) {
    return NextResponse.json({ error: "Invalid events payload." }, { status: 400 });
  }

  try {
    const baseVersion = Number(payload.baseVersion);
    const result = await appendEvents(planId, baseVersion, payload.events);
    return NextResponse.json({ version: result.version, events: result.events });
  } catch (error) {
    console.error("[appendEvents] Failed:", error);
    return NextResponse.json({ error: "Unable to append plan events." }, { status: 500 });
  }
}
