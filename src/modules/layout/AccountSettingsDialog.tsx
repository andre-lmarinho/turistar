"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import type { SubmitEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { normalizeUsername, validUsername } from "@/features/profile/utils/validUsername";
import { isRecord } from "@/lib/typeGuards";
import { LanguageSelect } from "@/modules/auth/components/LanguageSelect";
import { trpc } from "@/trpc/react";
import { Button } from "@/ui/components/button";
import { Dialog, DialogContent, DialogHeader } from "@/ui/components/dialog";
import { InputField } from "@/ui/components/form";
import { Spinner } from "@/ui/components/loading/Spinner";

type AccountSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  displayName: string | null;
  slug: string | null;
};

export function AccountSettingsDialog({ open, onOpenChange, displayName, slug }: AccountSettingsDialogProps) {
  const t = useTranslations();
  const router = useRouter();
  const [name, setName] = useState(displayName ?? "");
  const [username, setUsername] = useState(slug ?? "");
  const [error, setError] = useState<{
    field: "displayName" | "username" | "submit";
    message: string;
  } | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const submitting = useRef(false);
  const updateProfile = trpc.viewer.profile.update.useMutation();

  useEffect(() => {
    if (!open) return;
    setName(displayName ?? "");
    setUsername(slug ?? "");
    setError(null);
  }, [displayName, open, slug]);

  useEffect(() => {
    if (updateProfile.isPending) return;
    if (error?.field === "displayName") nameRef.current?.focus();
    if (error?.field === "username") usernameRef.current?.focus();
  }, [error, updateProfile.isPending]);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current) return;
    const normalizedUsername = normalizeUsername(username);
    if (!name.trim()) {
      setError({ field: "displayName", message: t("nameRequired") });
      nameRef.current?.focus();
      return;
    }
    if (!validUsername(normalizedUsername)) {
      setError({ field: "username", message: t("usernameInvalid") });
      usernameRef.current?.focus();
      return;
    }

    setError(null);
    submitting.current = true;
    try {
      await updateProfile.mutateAsync({ displayName: name.trim(), slug: normalizedUsername });
      onOpenChange(false);
      router.replace(`/u/${normalizedUsername}`);
      router.refresh();
    } catch (cause) {
      const usernameTaken = isRecord(cause) && isRecord(cause.data) && cause.data.code === "CONFLICT";
      setError({
        field: usernameTaken ? "username" : "submit",
        message: t(usernameTaken ? "usernameTaken" : "settingsSaveFailed"),
      });
    } finally {
      submitting.current = false;
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!submitting.current) onOpenChange(nextOpen);
      }}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-lg rounded-2xl">
        <DialogHeader
          title={t("accountSettings")}
          description={t("accountSettingsDescription")}
          closeDisabled={updateProfile.isPending}
        />
        <form onSubmit={handleSubmit} noValidate className="grid gap-5 p-5">
          <LanguageSelect className="flex flex-col items-start gap-2" />

          <div className="grid gap-4">
            <div>
              <InputField
                ref={nameRef}
                id="account-display-name"
                label={t("nameLabel")}
                name="displayName"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setError((current) => (current?.field === "displayName" ? null : current));
                }}
                autoComplete="name"
                placeholder={t("namePlaceholder")}
                maxLength={80}
                disabled={updateProfile.isPending}
                aria-invalid={error?.field === "displayName"}
                aria-describedby={error?.field === "displayName" ? "account-name-error" : undefined}
                required
              />
              {error?.field === "displayName" ? (
                <p id="account-name-error" role="alert" className="text-destructive mt-1 text-sm">
                  {error.message}
                </p>
              ) : null}
            </div>
            <div>
              <InputField
                ref={usernameRef}
                id="account-username"
                label={t("username")}
                name="username"
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                  setError((current) => (current?.field === "username" ? null : current));
                }}
                autoComplete="username"
                spellCheck={false}
                autoCapitalize="none"
                maxLength={28}
                disabled={updateProfile.isPending}
                aria-invalid={error?.field === "username"}
                aria-describedby={
                  error?.field === "username"
                    ? "account-username-error account-profile-hint"
                    : "account-profile-hint"
                }
                required
              />
              {error?.field === "username" ? (
                <p id="account-username-error" role="alert" className="text-destructive mt-1 text-sm">
                  {error.message}
                </p>
              ) : null}
              <p id="account-profile-hint" className="text-muted-foreground mt-1 text-xs wrap-break-word">
                {t("profileAvailableAt", { username: normalizeUsername(username) || "your-username" })}
              </p>
            </div>
          </div>

          {error?.field === "submit" ? (
            <p className="text-destructive text-sm" role="alert">
              {error.message}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              disabled={updateProfile.isPending}
              onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={updateProfile.isPending}
              aria-busy={updateProfile.isPending}
              className="gap-2">
              {updateProfile.isPending ? <Spinner className="size-4" /> : null}
              {t("saveChanges")}
            </Button>
          </div>
          <p role="status" className="sr-only">
            {updateProfile.isPending ? t("saving") : ""}
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
