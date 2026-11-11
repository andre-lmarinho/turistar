import { NextResponse } from "next/server";

import { getViewer } from "@/features/auth/lib/session";

export async function getUnauthorizedResponse(): Promise<NextResponse | null> {
  const viewer = await getViewer();
  if (viewer) return null;

  return NextResponse.json({ error: "Authentication required." }, { status: 401 });
}
