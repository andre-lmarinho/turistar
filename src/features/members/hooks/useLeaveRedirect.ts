"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import type { ShareMember } from "../types";

type UseLeaveMutation = {
  mutateAsync: () => Promise<unknown>;
};

type UseLeaveRedirectOptions = {
  viewerUserId: string | null;
  leave: UseLeaveMutation;
};

async function fetchProfileSlug(): Promise<string | null> {
  try {
    // Try to get existing slug
    const getController = new AbortController();
    const getTimeout = setTimeout(() => getController.abort(), 5000);
    try {
      const getRes = await fetch("/api/profile/slug", {
        method: "GET",
        credentials: "same-origin",
        signal: getController.signal,
      });
      clearTimeout(getTimeout);

      if (getRes.ok) {
        const data = (await getRes.json()) as { slug?: string | null };
        if (data.slug?.trim()) return data.slug;
      }
    } catch {
      clearTimeout(getTimeout);
    }

    // Try to ensure profile exists
    const postController = new AbortController();
    const postTimeout = setTimeout(() => postController.abort(), 5000);
    try {
      const postRes = await fetch("/api/profile/ensure", {
        method: "POST",
        credentials: "same-origin",
        signal: postController.signal,
      });
      clearTimeout(postTimeout);

      if (postRes.ok) {
        const data = (await postRes.json()) as { slug?: string | null };
        if (data.slug?.trim()) return data.slug;
      }
    } catch {
      clearTimeout(postTimeout);
    }

    return null;
  } catch {
    return null;
  }
}

export function useLeaveRedirect({ viewerUserId, leave }: UseLeaveRedirectOptions) {
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);

  const handleLeave = useCallback(
    async (member: ShareMember) => {
      setIsLeaving(true);

      try {
        await leave.mutateAsync();

        // Resolve redirect URL
        const slug = member.slug ?? (viewerUserId ? await fetchProfileSlug() : null);
        const redirectUrl = slug ? `/u/${slug}/planners` : null;

        if (redirectUrl) {
          router.push(redirectUrl);
          router.refresh();
        }
      } finally {
        setIsLeaving(false);
      }
    },
    [leave, viewerUserId, router]
  );

  return { handleLeave, isLeaving };
}
