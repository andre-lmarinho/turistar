"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { sendResetPasswordEmail } from "@/features/auth/handlers/sendResetPasswordEmail";
import { buildLoginHref, buildResetPasswordRedirectUrl, resolveNextPath } from "@/features/auth/lib/redirect";
import { validEmail } from "@/features/auth/utils/validEmail";
import { Button } from "@/ui/components/button/Button";
import { EmailField, Form } from "@/ui/components/form";
import { AccessShell } from "@/ui/components/layout";

export function ForgotPasswordView({ nextPath }: { nextPath?: string | null }) {
  const t = useTranslations();
  const safeNextPath = resolveNextPath(nextPath);
  const loginHref = buildLoginHref(safeNextPath);
  const [formError, setFormError] = useState<"resetEmailError" | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const formMethods = useForm<{ email: string }>({
    defaultValues: { email: "" },
  });
  const { register, formState } = formMethods;
  const handleSubmit = async ({ email }: { email: string }) => {
    setFormError(null);
    setEmailSent(false);

    try {
      const redirectTo = buildResetPasswordRedirectUrl(safeNextPath, window.location.origin);
      await sendResetPasswordEmail({ email, redirectTo });
      setEmailSent(true);
    } catch {
      setFormError("resetEmailError");
    }
  };

  return (
    <AccessShell
      title={t("forgotPasswordTitle")}
      footer={
        <Link href={loginHref} className="text-foreground hover:underline">
          {t("backToLogin")}
        </Link>
      }>
      <Form form={formMethods} onSubmit={handleSubmit} className="grid gap-6" noValidate>
        <EmailField
          label={t("email")}
          placeholder={t("emailPlaceholder")}
          autoComplete="email"
          required
          {...register("email", {
            required: "emailRequired",
            validate: (value) => (validEmail(value) ? true : "emailInvalid"),
          })}
        />
        {formError ? (
          <p role="alert" className="text-destructive text-sm">
            {t(formError)}
          </p>
        ) : null}
        {emailSent ? (
          <output className="text-muted-foreground text-sm" aria-live="polite">
            {t("resetEmailSent")}
          </output>
        ) : null}
        <Button type="submit" disabled={formState.isSubmitting} className="text-base font-semibold">
          {formState.isSubmitting ? t("sendingResetLink") : t("sendResetLink")}
        </Button>
      </Form>
    </AccessShell>
  );
}
