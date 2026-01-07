export function resolveNextPath(next: unknown): string | null {
  if (typeof next !== "string") return null;
  if (!next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

export function buildSignupHref(nextPath: string | null): string {
  return nextPath ? `/signup?next=${encodeURIComponent(nextPath)}` : "/signup";
}

export function buildLoginHref(nextPath: string | null): string {
  return nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login";
}

export function buildEmailRedirectUrl(nextPath: string | null, origin: string): string | undefined {
  if (!nextPath) return undefined;
  try {
    return new URL(nextPath, origin).toString();
  } catch {
    return undefined;
  }
}
