"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { signInWithPassword } from "@/features/auth/handlers/signInWithPassword";
import { buildSignupHref, resolveNextPath } from "@/features/auth/lib/redirect";
import { validEmail } from "@/features/auth/utils/validEmail";
import { demoSignIn } from "@/features/demo/lib/demoSignIn";
import { Button } from "@/ui/components/button/Button";
import { EmailField, Form, PasswordField } from "@/ui/components/form";
import { AccessShell } from "@/ui/components/layout";

const loginSchema = z.object({
  email: z.string().min(1, "emailRequired").refine(validEmail, "emailInvalid"),
  password: z.string().min(1, "passwordRequired"),
});

type LoginValues = { email: string; password: string };

const DEFAULT_VALUES: LoginValues = {
  email: "",
  password: "",
};

type LoginViewProps = {
  resolveProfile: () => Promise<string>;
  nextPath?: string | null;
};

export function LoginView({ resolveProfile, nextPath }: LoginViewProps) {
  const t = useTranslations();

  const router = useRouter();
  const safeNextPath = resolveNextPath(nextPath);
  const signupHref = buildSignupHref(safeNextPath);
  const forgotPasswordHref = safeNextPath
    ? `/forgot-password?next=${encodeURIComponent(safeNextPath)}`
    : "/forgot-password";
  const [formError, setFormError] = useState<"signInError" | null>(null);

  const formMethods = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const { register, formState } = formMethods;
  const handleSubmit: SubmitHandler<LoginValues> = async (values) => {
    setFormError(null);

    try {
      const { slug } = await signInWithPassword({
        email: values.email,
        password: values.password,
        resolveProfile,
      });

      router.push(safeNextPath ?? `/u/${slug}`);
      router.refresh();
    } catch {
      setFormError("signInError");
    }
  };

  const handleDemo = async () => {
    setFormError(null);
    try {
      const slug = await demoSignIn(resolveProfile);
      router.push(`/u/${slug}`);
      router.refresh();
    } catch {
      setFormError("signInError");
    }
  };

  return (
    <AccessShell
      title={t("welcomeBack")}
      footer={
        <Link href={signupHref} className="text-foreground hover:underline">
          {t("noAccount")}
        </Link>
      }>
      <Form form={formMethods} onSubmit={handleSubmit} className="grid gap-6" noValidate>
        <EmailField
          label={t("email")}
          placeholder={t("emailPlaceholder")}
          autoComplete="email"
          required
          {...register("email")}
        />
        <PasswordField
          label={
            <span className="flex w-full items-center justify-between">
              <span>{t("password")}</span>
              <Link href={forgotPasswordHref} className="text-muted-foreground hover:underline">
                {t("forgotPassword")}
              </Link>
            </span>
          }
          placeholder={t("passwordPlaceholder")}
          autoComplete="current-password"
          required
          {...register("password")}
        />
        {formError ? (
          <p role="alert" className="text-destructive text-sm">
            {t(formError)}
          </p>
        ) : null}
        <Button type="submit" disabled={formState.isSubmitting} className="text-base font-semibold">
          {formState.isSubmitting ? t("signingIn") : t("signIn")}
        </Button>
      </Form>
      <div className="border-border mt-5 border-t pt-5">
        <Button
          variant="accent"
          onClick={handleDemo}
          className="w-full py-3 text-base font-semibold shadow-sm transition-colors">
          {t("exploreDemo")}
        </Button>
      </div>
    </AccessShell>
  );
}
