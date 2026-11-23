"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

import { AccountSettingsDialog } from "@/modules/layout/AccountSettingsDialog";
import { supabase } from "@/supabase/client";
import { Avatar } from "@/ui/components/avatar";
import { LogOut, Settings } from "@/ui/components/icon";
import { Spinner } from "@/ui/components/loading/Spinner";
import { Popover, PopoverContent, PopoverTriggerButton } from "@/ui/components/popover";

type AvatarMenuProps = {
  displayName: string | null;
  email: string | null;
  slug: string | null;
};

export function AvatarMenu({ displayName, email, slug }: AvatarMenuProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState<"bottom" | "right">("bottom");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutFailed, setSignOutFailed] = useState(false);
  const signOutInFlight = useRef(false);
  const router = useRouter();

  async function handleSignOut() {
    if (signOutInFlight.current) return;
    signOutInFlight.current = true;
    setSigningOut(true);
    setSignOutFailed(false);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace("/login");
      router.refresh();
    } catch {
      signOutInFlight.current = false;
      setSigningOut(false);
      setSignOutFailed(true);
    }
  }

  return (
    <>
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          if (nextOpen) setSide(window.innerWidth >= 768 ? "right" : "bottom");
          setOpen(nextOpen);
        }}>
        <PopoverTriggerButton
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={t("accountMenu")}
          className="flex size-12 cursor-pointer items-center justify-center rounded-full transition-[background-color,transform] hover:bg-folio-highlight focus-visible:ring-2 focus-visible:ring-folio-coral focus-visible:outline-none active:scale-[0.96] motion-reduce:transition-none motion-reduce:active:scale-100">
          <Avatar
            displayName={displayName}
            size="lg"
            className="border-folio-line bg-folio-ink text-folio-paper"
          />
        </PopoverTriggerButton>

        <PopoverContent
          className="w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-folio-line bg-folio-paper p-0 text-folio-ink shadow-[0_14px_36px_rgba(23,58,54,0.16)]"
          side={side}
          align="end"
          sideOffset={8}>
          <div className="flex min-w-0 items-center gap-3 bg-folio-ink px-4 py-4 text-folio-paper">
            <Avatar
              displayName={displayName}
              size="xl"
              className="shrink-0 border-folio-citron/50 bg-folio-citron text-folio-ink"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{displayName ?? t("travelerFallback")}</p>
              <p className="truncate text-xs text-folio-paper/75">{email ?? t("signedIn")}</p>
            </div>
          </div>

          <div className="grid gap-1 p-2">
            <button
              type="button"
              disabled={signingOut}
              onClick={() => {
                setOpen(false);
                setSettingsOpen(true);
              }}
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-left text-sm font-medium transition-colors hover:bg-folio-highlight focus-visible:ring-2 focus-visible:ring-folio-coral focus-visible:outline-none disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none">
              <Settings className="size-4 text-folio-ink-soft" aria-hidden="true" />
              {t("settings")}
            </button>

            <button
              type="button"
              aria-disabled={signingOut}
              aria-busy={signingOut}
              aria-describedby={signOutFailed ? "sign-out-error" : undefined}
              onClick={handleSignOut}
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-left text-sm font-medium transition-colors hover:bg-folio-highlight focus-visible:ring-2 focus-visible:ring-folio-coral focus-visible:outline-none aria-disabled:cursor-wait aria-disabled:opacity-60 motion-reduce:transition-none">
              {signingOut ? (
                <Spinner className="size-4" />
              ) : (
                <LogOut className="size-4 text-folio-coral" aria-hidden="true" />
              )}
              {t("signOut")}
            </button>
            {signOutFailed ? (
              <p id="sign-out-error" role="alert" className="px-3 py-2 text-sm text-destructive-text">
                {t("signOutFailed")}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-2 border-t border-folio-line px-3 py-1 text-xs text-folio-ink-soft">
            <Link
              href="/privacy"
              className="inline-flex min-h-11 items-center underline-offset-2 hover:text-folio-ink hover:underline focus-visible:text-folio-ink focus-visible:underline">
              {t("privacyPolicy")}
            </Link>
            <span aria-hidden="true">·</span>
            <Link
              href="/terms"
              className="inline-flex min-h-11 items-center underline-offset-2 hover:text-folio-ink hover:underline focus-visible:text-folio-ink focus-visible:underline">
              {t("termsOfUse")}
            </Link>
          </div>
        </PopoverContent>
      </Popover>

      <AccountSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        displayName={displayName}
        slug={slug}
      />
    </>
  );
}
