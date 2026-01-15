"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import type { PlanMemberProfile } from "@/features/share/hook/usePlanSharing";

type ProfileSlugResponse = {
  slug?: string | null;
};

const toPlannerHref = (slug: string | null): string | null => (slug ? `/u/${slug}/planners` : null);

const parseProfileSlug = (data: ProfileSlugResponse | null): string | null => {
  const slug = data?.slug;
  return typeof slug === "string" && slug.trim().length > 0 ? slug : null;
};

async function requestProfileSlug(url: string, method: "GET" | "POST"): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(url, {
      method,
      credentials: "same-origin",
      signal: controller.signal,
    });

    const data = response.ok ? ((await response.json()) as ProfileSlugResponse) : null;
    return parseProfileSlug(data);
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

type UseLeavePlannerRedirectArgs = {
  viewerUserId: string | null;
  leave: { mutateAsync: () => Promise<unknown> };
};

export function useLeavePlannerRedirect({ viewerUserId, leave }: UseLeavePlannerRedirectArgs) {
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);

  const resolveRedirectHref = useCallback(
    async (member: PlanMemberProfile): Promise<string | null> => {
      const memberSlug = parseProfileSlug({ slug: member.slug });
      if (!viewerUserId && !memberSlug) {
        return null;
      }
      const slug =
        memberSlug ??
        (viewerUserId ? await requestProfileSlug("/api/profile/slug", "GET") : null) ??
        (viewerUserId ? await requestProfileSlug("/api/profile/ensure", "POST") : null);
      return toPlannerHref(slug);
    },
    [viewerUserId]
  );

  const handleLeave = useCallback(
    async (member: PlanMemberProfile) => {
      setIsLeaving(true);
      try {
        await leave.mutateAsync();
      } catch {
        setIsLeaving(false);
        return;
      }
      const redirectHref = await resolveRedirectHref(member);
      if (!redirectHref) {
        setIsLeaving(false);
        return;
      }
      router.push(redirectHref);
      router.refresh();
    },
    [leave, resolveRedirectHref, router]
  );

  return { handleLeave, isLeaving };
}
