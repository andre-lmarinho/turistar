"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type { AcceptShareLinkResult } from "@/features/app/planner/server/actions/plans/acceptPlanShareLink";

type UseShareLinkAutoJoinArgs = {
  token: string;
  acceptShareLink: (token: string) => Promise<AcceptShareLinkResult>;
};

export type JoinStatus = "idle" | "joining" | "error";

type AuthSessionResponse = {
  userId?: string | null;
};

/**
 * Fetches the current authenticated session and returns the session's user ID if available.
 *
 * Performs a same-origin request for the current auth session; if no authenticated session exists
 * or the request fails, the function yields `null`.
 *
 * @returns The `userId` string when an authenticated session exists, `null` otherwise.
 */
async function fetchAuthSession(): Promise<string | null> {
  const response = await fetch("/api/auth/session", {
    method: "GET",
    credentials: "same-origin",
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as AuthSessionResponse;
  return typeof data.userId === "string" && data.userId.length > 0 ? data.userId : null;
}

/**
 * Exchanges an authorization code with the server to establish an authenticated session.
 *
 * @param code - The authorization code received from the identity provider
 * @returns `true` if the server accepted the code and responded with a successful status, `false` otherwise.
 */
async function exchangeAuthCode(code: string): Promise<boolean> {
  const response = await fetch("/api/auth/exchange", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  return response.ok;
}

/**
 * Automatically attempts to accept a shared plan link and join the associated plan.
 *
 * Attempts to use the current authentication session (and an optional `code` URL parameter) to call `acceptShareLink`, retrying with increasing delays if the user is not yet authenticated. Retries are re-triggered when the tab gains focus or becomes visible. Updates and returns the current join status.
 *
 * @param token - The share link token to accept
 * @param acceptShareLink - Function that accepts the share link token and resolves to an `AcceptShareLinkResult`
 * @returns The current join status: `"idle"`, `"joining"`, or `"error"`
 */
export function useShareLinkAutoJoin({ token, acceptShareLink }: UseShareLinkAutoJoinArgs) {
  const router = useRouter();
  const joinRef = useRef(false);
  const exchangeAttemptedRef = useRef(false);
  const [status, setStatus] = useState<JoinStatus>("idle");

  useEffect(() => {
    let active = true;
    let retryTimer: number | null = null;
    let retryIndex = 0;
    const retryDelays = [500, 1000, 2000, 5000, 10000];

    const clearRetry = () => {
      if (retryTimer !== null) {
        window.clearTimeout(retryTimer);
        retryTimer = null;
      }
    };

    const scheduleRetry = () => {
      if (!active || joinRef.current || retryTimer !== null) {
        return;
      }
      const delay = retryDelays[Math.min(retryIndex, retryDelays.length - 1)];
      retryIndex += 1;
      retryTimer = window.setTimeout(() => {
        retryTimer = null;
        void attemptJoin();
      }, delay);
    };

    const attemptJoin = async () => {
      if (joinRef.current) {
        return;
      }
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      let sessionUserId = await fetchAuthSession();

      if (!sessionUserId && code && !exchangeAttemptedRef.current) {
        exchangeAttemptedRef.current = true;
        const exchanged = await exchangeAuthCode(code);
        if (exchanged) {
          url.searchParams.delete("code");
          window.history.replaceState(null, "", url.toString());
          sessionUserId = await fetchAuthSession();
        }
      }

      if (!sessionUserId || joinRef.current) {
        scheduleRetry();
        return;
      }

      clearRetry();
      joinRef.current = true;
      setStatus("joining");

      const result = await acceptShareLink(token);
      if (!active) return;

      if (result.success) {
        router.replace(`/p/${result.planId}`);
        router.refresh();
      } else {
        joinRef.current = false;
        setStatus("error");
      }
    };

    void attemptJoin();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void attemptJoin();
      }
    };

    window.addEventListener("focus", handleVisibilityChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      clearRetry();
      window.removeEventListener("focus", handleVisibilityChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [acceptShareLink, router, token]);

  return status;
}