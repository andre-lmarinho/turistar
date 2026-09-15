"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { exchangeResetPasswordSession } from "@/features/auth/handlers/exchangeResetPasswordSession";
import { updatePassword } from "@/features/auth/handlers/updatePassword";
import { buildLoginHref, resolveNextPath } from "@/features/auth/lib/redirect";
import { readResetPasswordParams } from "@/features/auth/utils/readResetPasswordParams";
import { MIN_PASSWORD_LENGTH, validPassword } from "@/features/auth/utils/validPassword";
import { Button } from "@/ui/components/button/Button";
import { Form, PasswordField } from "@/ui/components/form";
import { AccessShell } from "@/ui/components/layout";

function getHashParams(): URLSearchParams | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.hash.replace(/^#/, ""));
}

export function ResetPasswordView({ nextPath }: { nextPath?: string | null }) {
  const searchParams = useSearchParams();
  const t = useTranslations();
  const safeNextPath = resolveNextPath(nextPath);
  const loginHref = buildLoginHref(safeNextPath);
  const [formError, setFormError] = useState<"invalidResetLink" | "resetPasswordError" | null>(null);
  const [exchangeState, setExchangeState] = useState<"idle" | "validating" | "ready" | "error">("idle");
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  const formMethods = useForm<{ password: string }>({
    defaultValues: { password: "" },
  });
  const { register, formState } = formMethods;
  useEffect(() => {
    const hashParams = getHashParams();
    const { code, error } = readResetPasswordParams(searchParams, hashParams);

    if (error) {
      setExchangeState("error");
      setFormError("invalidResetLink");
      return;
    }

    if (!code) {
      setExchangeState("error");
      setFormError("invalidResetLink");
      return;
    }

    let isActive = true;

    async function validateResetCode(resetCode: string) {
      setFormError(null);
      setExchangeState("validating");

      const result = await exchangeResetPasswordSession(resetCode);

      if (!isActive) return;

      if (result.status === "error") {
        setExchangeState("error");
        setFormError("invalidResetLink");
        return;
      }

      setExchangeState("ready");
    }

    void validateResetCode(code);

    return () => {
      isActive = false;
    };
  }, [searchParams]);

  const handleSubmit = async ({ password }: { password: string }) => {
    if (exchangeState !== "ready") {
      setFormError("invalidResetLink");
      return;
    }

    setFormError(null);
    setPasswordUpdated(false);

    try {
      const result = await updatePassword(password);
      if (!result.ok) {
        throw result.error;
      }
      setPasswordUpdated(true);
    } catch {
      setFormError("resetPasswordError");
    }
  };

  return (
    <AccessShell
      title={t("resetPasswordTitle")}
      footer={
        <Link href={loginHref} className="text-foreground hover:underline">
          {t("backToLogin")}
        </Link>
      }>
      <Form form={formMethods} onSubmit={handleSubmit} className="grid gap-6" noValidate>
        <PasswordField
          label={t("newPassword")}
          placeholder={t("createPasswordPlaceholder")}
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          required
          {...register("password", {
            required: "passwordRequired",
            validate: (value) => (validPassword(value) ? true : "passwordMinLength"),
          })}
        />
        {exchangeState === "validating" ? (
          <output className="text-muted-foreground text-sm" aria-live="polite">
            {t("validatingResetLink")}
          </output>
        ) : null}
        {formError ? (
          <p role="alert" className="text-destructive text-sm">
            {t(formError)}
          </p>
        ) : null}
        {passwordUpdated ? (
          <output className="text-muted-foreground text-sm" aria-live="polite">
            {t("passwordUpdated")}
          </output>
        ) : null}
        <Button
          type="submit"
          disabled={formState.isSubmitting || exchangeState !== "ready"}
          className="text-base font-semibold">
          {formState.isSubmitting ? t("updatingPassword") : t("updatePassword")}
        </Button>
      </Form>
    </AccessShell>
  );
}
