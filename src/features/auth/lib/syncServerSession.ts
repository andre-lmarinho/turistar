import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

export async function syncServerSession(event: AuthChangeEvent, session: Session | null): Promise<void> {
  if (!session) {
    // Sign-up flows that require email confirmation may not include a session yet.
    return;
  }

  const userId = session.user?.id ?? "unknown";
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch("/auth/callback", {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      credentials: "same-origin",
      body: JSON.stringify({ event, session }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(
        `syncServerSession failed: event=${event} userId=${userId} status=${response.status} ${response.statusText}${body ? ` body=${body}` : ""}`
      );
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`syncServerSession timed out: event=${event} userId=${userId}`);
    }

    // Re-throw if already formatted by this function
    if (error instanceof Error && error.message.startsWith("syncServerSession")) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "unknown error";
    throw new Error(`syncServerSession failed: event=${event} userId=${userId} error=${message}`);
  } finally {
    clearTimeout(timeoutId);
  }
}
