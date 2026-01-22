import { NextResponse } from "next/server";

import { isUsernameAvailable } from "@/features/auth/lib/isUsernameAvailable";
import { normalizeUsername, validUsername } from "@/features/auth/utils/validUsername";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const usernameParam = searchParams.get("username") ?? "";
  const normalized = normalizeUsername(usernameParam);

  if (!normalized) {
    return NextResponse.json({ error: "Username is required." }, { status: 400 });
  }

  if (!validUsername(normalized)) {
    return NextResponse.json({ error: "Username contains invalid characters or format." }, { status: 400 });
  }

  try {
    const available = await isUsernameAvailable(normalized);
    return NextResponse.json({ available });
  } catch (error) {
    console.error("profile availability failed: username=%s", normalized, error);
    return NextResponse.json({ error: "Unable to check username availability." }, { status: 500 });
  }
}
