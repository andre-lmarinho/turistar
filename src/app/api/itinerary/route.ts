import { NextRequest, NextResponse } from "next/server";
import salvador from "@/data/salvador.json";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const destination = searchParams.get("dest")?.toLowerCase();

  // In the MVP we only have Salvador; later you’ll query DB/AI.
  if (destination !== "salvador") {
    return NextResponse.json(
      { error: "Destination not supported yet." },
      { status: 404 }
    );
  }

  return NextResponse.json(salvador);
}
