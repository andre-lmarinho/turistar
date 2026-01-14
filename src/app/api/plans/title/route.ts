import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getPlanTitle } from "@/features/app/planner/server/queries/plans/getPlanTitle";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const planId = searchParams.get("planId")?.trim();

  if (!planId) {
    return NextResponse.json({ error: "Missing planId." }, { status: 400 });
  }

  try {
    const title = await getPlanTitle(planId);
    return NextResponse.json({ title });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to fetch plan title." }, { status: 500 });
  }
}
