"use client";

import { useRouter } from "next/navigation";
import type { PlanMemberProfile } from "@/features/share/hook/usePlanSharing";

type EnsureProfileResponse = {
  slug?: string | null;
};

type ProfileSlugResponse = {
  slug?: string | null;
};

async function fetchProfileSlug(): Promise<string | null> {
  try {
    const response = await fetch("/api/profile/slug", {
      method: "GET",
      credentials: "same-origin",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as ProfileSlugResponse;
    if (typeof data.slug !== "string" || data.slug.trim().length === 0) {
      return null;
    }

    return data.slug;
  } catch {
    return null;
  }
}

async function ensureProfileSlug(): Promise<string | null> {
  try {
    const response = await fetch("/api/profile/ensure", {
      method: "POST",
      credentials: "same-origin",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as EnsureProfileResponse;
    if (typeof data.slug !== "string" || data.slug.trim().length === 0) {
      return null;
    }

    return data.slug;
  } catch {
    return null;
  }
}

type UseLeavePlannerRedirectArgs = {
  viewerUserId: string | null;
  leave: { mutateAsync: () => Promise<unknown> };
};

export function useLeavePlannerRedirect({ viewerUserId, leave }: UseLeavePlannerRedirectArgs) {
  const router = useRouter();

  const resolveRedirectHref = async (member: PlanMemberProfile) => {
    if (member.slug) {
      return `/u/${member.slug}/planners`;
    }
    if (!viewerUserId) {
      return "/";
    }
    const profileSlug = await fetchProfileSlug();
    if (profileSlug) {
      return `/u/${profileSlug}/planners`;
    }
    const slug = await ensureProfileSlug();
    return slug ? `/u/${slug}/planners` : "/";
  };

  const handleLeave = async (member: PlanMemberProfile) => {
    const redirectHref = await resolveRedirectHref(member);
    try {
      await leave.mutateAsync();
      router.push(redirectHref);
      router.refresh();
    } catch {
      // keep user in place if leaving fails
    }
  };

  return { resolveRedirectHref, handleLeave };
}
