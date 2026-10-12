"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { exchangeResetPasswordSession } from "@/features/auth/handlers/exchangeResetPasswordSession";
import { updatePassword } from "@/features/auth/handlers/updatePassword";
import { buildLoginHref, resolveNextPath } from "@/features/auth/lib/redirect";
import { readResetPasswordParams } from "@/features/auth/utils/readResetPasswordParams";
import { MIN_PASSWORD_LENGTH, validPassword } from "@/features/auth/utils/validPassword";
import { AccessShell } from "@/modules/auth/components/AccessShell";
import { Button } from "@/ui/components/button/Button";
import { Form, PasswordField } from "@/ui/components/form";
import { Spinner } from "@/ui/components/loading/Spinner";

function getHashParams(): URLSearchParams | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.hash.replace(/^#/, ""));
}

export function ResetPasswordView({ nextPath }: { nextPath?: string | null }) {
  const searchParams = useSearchParams();
  const t = useTranslations();
  const safeNextPath = resolveNextPath(nextPath);
  const loginHref = buildLoginHref(safeNextPath);
  const forgotPasswordHref = safeNextPath
    ? `/forgot-password?next=${encodeURIComponent(safeNextPath)}`
    : "/forgot-password";
  const [formError, setFormError] = useState<"invalidResetLink" | "resetPasswordError" | null>(null);
  const [exchangeState, setExchangeState] = useState<"idle" | "validating" | "ready" | "error">("idle");
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const successMessageRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (passwordUpdated) successMessageRef.current?.focus();
  }, [passwordUpdated]);

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

      try {
        const result = await exchangeResetPasswordSession(resetCode);
        if (!isActive) return;
        if (result.status === "error") {
          setExchangeState("error");
          setFormError("invalidResetLink");
          return;
        }
        setExchangeState("ready");
      } catch {
        if (!isActive) return;
        setExchangeState("error");
        setFormError("invalidResetLink");
      }
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
      {exchangeState === "idle" || exchangeState === "validating" ? (
        <p role="status" className="text-muted-foreground flex items-center gap-2 text-sm">
          <Spinner className="size-4 shrink-0" />
          {t("validatingResetLink")}
        </p>
      ) : exchangeState === "error" ? (
        <div className="grid gap-6">
          <p role="alert" className="text-destructive text-sm">
            {t("invalidResetLink")}
          </p>
          <Button href={forgotPasswordHref} className="min-h-11">
            {t("requestNewResetLink")}
          </Button>
        </div>
      ) : passwordUpdated ? (
        <p ref={successMessageRef} role="status" tabIndex={-1} className="text-muted-foreground text-sm">
          {t("passwordUpdated")}
        </p>
      ) : (
        <Form
          form={formMethods}
          onSubmit={handleSubmit}
          className="grid gap-6"
          aria-busy={formState.isSubmitting}
          noValidate>
          <PasswordField
            label={t("newPassword")}
            placeholder={t("createPasswordPlaceholder")}
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            readOnly={formState.isSubmitting}
            required
            {...register("password", {
              required: "passwordRequired",
              validate: (value) => (validPassword(value) ? true : "passwordMinLength"),
            })}
          />
          {formError ? (
            <p role="alert" className="text-destructive text-sm">
              {t(formError)}
            </p>
          ) : null}
          <Button
            type="submit"
            disabled={formState.isSubmitting}
            aria-busy={formState.isSubmitting}
            className="min-h-11 gap-2 text-base font-semibold">
            {formState.isSubmitting ? <Spinner className="size-4" /> : null}
            {t("updatePassword")}
          </Button>
        </Form>
      )}
      <p role="status" className="sr-only">
        {formState.isSubmitting ? t("updatingPassword") : ""}
      </p>
    </AccessShell>
  );
}
