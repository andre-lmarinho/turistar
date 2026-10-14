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
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTriggerButton
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={t("accountMenu")}
          className="focus-visible:ring-ring flex size-11 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-interactive-hover focus-visible:ring-2 focus-visible:outline-none active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100">
          <Avatar displayName={displayName} size="lg" />
        </PopoverTriggerButton>

        <PopoverContent
          className="border-border text-foreground w-56 max-w-[calc(100vw-2rem)] rounded-xl border p-2 shadow-md"
          side="bottom"
          align="end"
          sideOffset={8}>
          <div className="flex min-w-0 items-center gap-2 px-3 py-1">
            <Avatar displayName={displayName} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{displayName ?? t("travelerFallback")}</p>
              <p className="text-muted-foreground truncate text-xs">{email ?? t("signedIn")}</p>
            </div>
          </div>

          <div className="border-border mt-2 grid gap-1 border-t pt-1">
            <button
              type="button"
              disabled={signingOut}
              onClick={() => {
                setOpen(false);
                setSettingsOpen(true);
              }}
              className="hover:bg-interactive-hover focus-visible:ring-ring flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md px-3 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none">
              <Settings className="text-muted-foreground size-4" aria-hidden="true" />
              {t("settings")}
            </button>
          </div>

          <div className="border-border mt-1 border-t pt-1">
            <button
              type="button"
              aria-disabled={signingOut}
              aria-busy={signingOut}
              aria-describedby={signOutFailed ? "sign-out-error" : undefined}
              onClick={handleSignOut}
              className="hover:bg-interactive-hover focus-visible:ring-ring flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md px-3 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none aria-disabled:cursor-wait aria-disabled:opacity-60 motion-reduce:transition-none">
              {signingOut ? <Spinner className="size-4" /> : <LogOut className="size-4" aria-hidden="true" />}
              {t("signOut")}
            </button>
          </div>
          {signOutFailed ? (
            <p id="sign-out-error" role="alert" className="text-destructive-text px-3 py-2 text-sm">
              {t("signOutFailed")}
            </p>
          ) : null}

          <div className="text-muted-foreground mt-1 flex flex-wrap items-center justify-center gap-x-2 border-t text-[11px]">
            <Link
              href="/privacy"
              className="hover:text-foreground focus-visible:text-foreground inline-flex min-h-11 items-center underline-offset-2 hover:underline">
              {t("privacyPolicy")}
            </Link>
            <span aria-hidden="true">·</span>
            <Link
              href="/terms"
              className="hover:text-foreground focus-visible:text-foreground inline-flex min-h-11 items-center underline-offset-2 hover:underline">
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
