"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { supabase } from "@/supabase/client";
import { trpc } from "@/trpc/react";
import { Button } from "@/ui/components/button";

type Profile = { slug: string | null };

export function DesktopActions() {
  const t = useTranslations();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const profileUtils = trpc.useUtils();

  useEffect(() => {
    if (retryCount > 0) setLoading(true);
    let active = true;
    let latestRequest = 0;
    let lastUserId: string | null = null;

    async function loadProfile(userId: string | null | undefined) {
      const request = ++latestRequest;
      if (active) setFailed(false);
      const nextUserId = userId ?? null;
      if (nextUserId !== lastUserId && active) {
        setProfile(null);
        setLoading(Boolean(nextUserId));
      }
      lastUserId = nextUserId;
      if (!userId) {
        if (active) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      try {
        const profile = await profileUtils.client.viewer.profile.get.query({});
        if (active && request === latestRequest) setProfile({ slug: profile.slug });
      } catch {
        if (active && request === latestRequest) setFailed(true);
      } finally {
        if (active && request === latestRequest) setLoading(false);
      }
    }

    const initialRequest = latestRequest;
    void supabase.auth
      .getSession()
      .then(({ data }) => {
        if (active && latestRequest === initialRequest) return loadProfile(data.session?.user?.id);
      })
      .catch(() => {
        if (active && latestRequest === initialRequest) {
          setFailed(true);
          setLoading(false);
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void loadProfile(session?.user?.id);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [profileUtils, retryCount]);

  const destination = profile?.slug ? `/u/${profile.slug}` : null;

  return (
    <div className="ml-auto flex items-center gap-2 sm:gap-4 lg:ml-0 lg:justify-self-end">
      {loading ? (
        <div role="status" className="bg-muted h-11 w-40 rounded-md motion-safe:animate-pulse">
          <span className="sr-only">{t("loadingDefault")}</span>
        </div>
      ) : destination ? (
        <Button href={destination} variant="accent">
          {t("goToPlanner")}
        </Button>
      ) : failed ? (
        <div>
          <p role="alert" className="sr-only">
            {t("profileLoadFailed")}
          </p>
          <Button
            variant="ghost"
            title={t("profileLoadFailed")}
            onClick={() => setRetryCount((count) => count + 1)}>
            {t("retry")}
          </Button>
        </div>
      ) : (
        <>
          <Button href="/login" variant="ghost">
            {t("logIn")}
          </Button>
          <Button href="/">{t("getStarted")}</Button>
        </>
      )}
    </div>
  );
}
