"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/shared/lib/supabaseClient";
import { formatSupabaseError } from "@/shared/lib/supabaseErrors";
import { Button } from "@/shared/ui/button";

type Profile = { slug: string | null };

export function DesktopActions() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError) {
          console.error(
            formatSupabaseError({
              operation: "DesktopActions.loadProfile:getUser",
              error: authError,
            })
          );
          if (active) setProfile(null);
          return;
        }

        const userId = authData.user?.id;
        if (!userId) {
          if (active) setProfile(null);
          return;
        }

        const { data, error } = await supabase.from("profiles").select("slug").eq("id", userId).maybeSingle();

        if (error) {
          console.error(
            formatSupabaseError({
              operation: "DesktopActions.loadProfile:selectProfile",
              identifiers: { userId },
              error,
            })
          );
          if (active) setProfile(null);
          return;
        }

        const slug =
          data && typeof data === "object" && "slug" in data && typeof data.slug === "string"
            ? data.slug
            : null;

        if (active) {
          setProfile({ slug });
        }
      } catch (error) {
        console.error(
          formatSupabaseError({
            operation: "DesktopActions.loadProfile:unexpected",
            error,
          })
        );
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
