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
import { Pencil } from "@/ui/components/icon";
import { Spinner } from "@/ui/components/loading/Spinner";

type AccountSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  displayName: string | null;
  slug: string | null;
};

type EditableField = "displayName" | "username";

export function AccountSettingsDialog({ open, onOpenChange, displayName, slug }: AccountSettingsDialogProps) {
  const t = useTranslations();
  const router = useRouter();
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [value, setValue] = useState("");
  const [error, setError] = useState<{
    field: EditableField | "submit";
    message: string;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const submitting = useRef(false);
  const updateProfile = trpc.viewer.profile.update.useMutation();

  useEffect(() => {
    if (!editingField) return;
    setValue(editingField === "displayName" ? (displayName ?? "") : (slug ?? ""));
    setError(null);
  }, [displayName, editingField, slug]);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current || !editingField) return;

    const nextDisplayName = editingField === "displayName" ? value.trim() : (displayName?.trim() ?? "");
    const nextSlug = editingField === "username" ? normalizeUsername(value) : (slug?.trim() ?? "");

    if (editingField === "displayName" && !nextDisplayName) {
      setError({ field: "displayName", message: t("nameRequired") });
      inputRef.current?.focus();
      return;
    }
    if (editingField === "username" && !validUsername(nextSlug)) {
      setError({ field: "username", message: t("usernameInvalid") });
      inputRef.current?.focus();
      return;
    }

    setError(null);
    submitting.current = true;
    try {
      await updateProfile.mutateAsync({ displayName: nextDisplayName, slug: nextSlug });
      setEditingField(null);
      if (editingField === "username") router.replace(`/u/${nextSlug}`);
      router.refresh();
    } catch (cause) {
      const usernameTaken =
        editingField === "username" &&
        isRecord(cause) &&
        isRecord(cause.data) &&
        cause.data.code === "CONFLICT";
      setError({
        field: usernameTaken ? "username" : "submit",
        message: t(usernameTaken ? "usernameTaken" : "settingsSaveFailed"),
      });
    } finally {
      submitting.current = false;
    }
  };

  const isEditingName = editingField === "displayName";
  const editTitle = isEditingName ? t("editName") : t("editUsername");

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!submitting.current) onOpenChange(nextOpen);
      }}>
      <DialogContent
        backdropClassName="bg-folio-ink/45"
        className="w-[calc(100%-2rem)] max-w-lg rounded-2xl border-folio-line bg-folio-paper p-0 shadow-[0_24px_70px_rgba(23,58,54,0.18)] focus-visible:ring-folio-coral focus-visible:ring-offset-folio-paper">
        <DialogHeader
          title={t("accountSettings")}
          description={t("accountSettingsDescription")}
          descriptionVisuallyHidden={false}
          className="items-start gap-4 border-b border-folio-paper/20 bg-folio-ink px-5 py-5 text-folio-paper sm:px-6"
          titleClassName="font-folio-display text-2xl font-semibold tracking-[-0.025em]"
          descriptionClassName="max-w-sm text-sm leading-relaxed text-folio-paper/75"
          closeButtonClassName="shrink-0 text-folio-paper/75 hover:bg-folio-paper/10 hover:text-folio-paper focus-visible:ring-folio-citron"
          closeDisabled={updateProfile.isPending}
        />
        <div className="grid bg-folio-paper px-5 py-2 sm:px-6">
          <div className="flex flex-col gap-3 border-b border-folio-line py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-folio-ink">{t("language")}</p>
              <p className="mt-1 text-sm text-folio-ink-soft">{t("languageDescription")}</p>
            </div>
            <LanguageSelect className="flex flex-col items-start gap-2 sm:shrink-0" />
          </div>

          <EditableAccountRow
            label={t("nameLabel")}
            description={t("nameDescription")}
            value={displayName ?? ""}
            editLabel={t("editName")}
            onEdit={() => setEditingField("displayName")}
          />
          <EditableAccountRow
            label={t("username")}
            description={t("usernameDescription")}
            value={slug ?? ""}
            editLabel={t("editUsername")}
            onEdit={() => setEditingField("username")}
          />
        </div>
        <Dialog
          open={editingField !== null}
          onOpenChange={(nextOpen) => {
            if (!submitting.current && !nextOpen) {
              setEditingField(null);
              setError(null);
            }
          }}>
          <DialogContent
            backdropClassName="bg-folio-ink/45"
            className="w-[calc(100%-2rem)] max-w-md rounded-2xl border-folio-line bg-folio-paper p-0 shadow-[0_24px_70px_rgba(23,58,54,0.18)] focus-visible:ring-folio-coral focus-visible:ring-offset-folio-paper">
            <DialogHeader
              title={editTitle}
              description={isEditingName ? t("nameDescription") : t("usernameDescription")}
              descriptionVisuallyHidden
              className="items-start gap-4 border-b border-folio-paper/20 bg-folio-ink px-5 py-5 text-folio-paper sm:px-6"
              titleClassName="font-folio-display text-2xl font-semibold tracking-[-0.025em]"
              closeButtonClassName="shrink-0 text-folio-paper/75 hover:bg-folio-paper/10 hover:text-folio-paper focus-visible:ring-folio-citron"
              closeDisabled={updateProfile.isPending}
            />
            <form onSubmit={handleSubmit} noValidate className="grid gap-5 bg-folio-paper p-5 sm:p-6">
              <div>
                <InputField
                  ref={inputRef}
                  id={isEditingName ? "account-display-name" : "account-username"}
                  label={isEditingName ? t("nameLabel") : t("username")}
                  name={isEditingName ? "displayName" : "username"}
                  value={value}
                  onChange={(event) => {
                    setValue(event.target.value);
                    setError((current) => (current?.field === editingField ? null : current));
                  }}
                  className="h-11 rounded-lg border-folio-line bg-folio-white text-folio-ink placeholder:text-folio-ink-soft/70 hover:border-folio-ink-soft focus:border-folio-coral focus:ring-folio-coral"
                  autoComplete={isEditingName ? "name" : "username"}
                  placeholder={isEditingName ? t("namePlaceholder") : undefined}
                  maxLength={isEditingName ? 80 : 28}
                  spellCheck={!isEditingName ? false : undefined}
                  autoCapitalize={!isEditingName ? "none" : undefined}
                  readOnly={updateProfile.isPending}
                  aria-invalid={error?.field === editingField}
                  aria-describedby={
                    isEditingName
                      ? error?.field === "displayName" || error?.field === "submit"
                        ? "account-edit-error"
                        : undefined
                      : error?.field === "username" || error?.field === "submit"
                        ? "account-edit-error account-profile-hint"
                        : "account-profile-hint"
                  }
                  required
                />
                {error?.field === editingField ? (
                  <p id="account-edit-error" role="alert" className="text-destructive-text mt-1 text-sm">
                    {error.message}
                  </p>
                ) : null}
                {isEditingName ? null : (
                  <p
                    id="account-profile-hint"
                    className="mt-2 text-xs leading-relaxed text-folio-ink-soft wrap-break-word">
                    {t("profileAvailableAt", { username: normalizeUsername(value) || "your-username" })}
                  </p>
                )}
              </div>
              {error?.field === "submit" ? (
                <p id="account-edit-error" className="text-destructive-text text-sm" role="alert">
                  {error.message}
                </p>
              ) : null}
              <div className="flex flex-col-reverse gap-2 border-t border-folio-line pt-4 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={updateProfile.isPending}
                  onClick={() => setEditingField(null)}>
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  aria-disabled={updateProfile.isPending}
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
      </DialogContent>
    </Dialog>
  );
}

function EditableAccountRow({
  label,
  description,
  value,
  editLabel,
  onEdit,
}: {
  label: string;
  description: string;
  value: string;
  editLabel: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex min-h-20 items-center justify-between gap-4 border-b border-folio-line py-4 last:border-b-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-folio-ink">{label}</p>
        <p className="mt-1 text-sm text-folio-ink-soft">{description}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="max-w-36 truncate text-right text-sm text-folio-ink sm:max-w-52">{value}</span>
        <button
          type="button"
          aria-label={editLabel}
          aria-haspopup="dialog"
          onClick={onEdit}
          className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full text-folio-ink-soft transition-colors hover:bg-folio-highlight hover:text-folio-ink focus-visible:ring-2 focus-visible:ring-folio-coral focus-visible:outline-none">
          <Pencil className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
