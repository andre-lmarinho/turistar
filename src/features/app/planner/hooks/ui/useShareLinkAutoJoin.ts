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

async function exchangeAuthCode(code: string): Promise<boolean> {
  const response = await fetch("/api/auth/exchange", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  return response.ok;
}

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
