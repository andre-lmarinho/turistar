"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/shared/lib/supabaseClient";
import type { Database } from "@/shared/types/supabase";
import { Button } from "@/shared/ui/button";

type Profile = { slug: string | null };
type ProfileSlugRow = Pick<Database["public"]["Tables"]["profiles"]["Row"], "slug">;

export function DesktopActions() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData.user?.id;
        if (!userId) {
          setProfile(null);
          return;
        }

        const { data } = await supabase
          .from<ProfileSlugRow>("profiles")
          .select("slug")
          .eq("id", userId)
          .maybeSingle();

        if (active) {
          setProfile({ slug: data?.slug ?? null });
        }
      } catch {
        if (active) setProfile(null);
      }
    }

    void loadProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadProfile();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const destination = profile?.slug ? `/u/${profile.slug}/planners` : null;

  return (
    <div className="ml-auto flex items-center gap-6 lg:ml-0 lg:justify-self-end">
      {destination ? (
        <Button href={destination} variant="accent">
          Go to Planner
        </Button>
      ) : (
        <>
          <Button href="/p/inspiration/rome" variant="ghost">
            Try a demo
          </Button>
          <Button href="/signup">Get started</Button>
        </>
      )}
    </div>
  );
}
