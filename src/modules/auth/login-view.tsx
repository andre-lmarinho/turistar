"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { signInWithPassword } from "@/features/auth/handlers/signInWithPassword";
import { buildSignupHref, resolveNextPath } from "@/features/auth/lib/redirect";
import { validEmail } from "@/features/auth/utils/validEmail";
import { demoSignIn } from "@/features/demo/lib/demoSignIn";
import { AccessShell } from "@/modules/auth/components/AccessShell";
import { Button } from "@/ui/components/button/Button";
import { EmailField, Form, PasswordField } from "@/ui/components/form";
import { Spinner } from "@/ui/components/loading/Spinner";

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
  const [pendingAction, setPendingAction] = useState<"login" | "demo" | null>(null);
  const authPendingRef = useRef(false);

  const formMethods = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const { register, formState } = formMethods;
  const handleSubmit: SubmitHandler<LoginValues> = async (values) => {
    if (authPendingRef.current) return;
    authPendingRef.current = true;
    setPendingAction("login");
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
      authPendingRef.current = false;
      setPendingAction(null);
      setFormError("signInError");
    }
  };

  const handleDemo = async () => {
    if (authPendingRef.current || formState.isSubmitting) return;

    authPendingRef.current = true;
    setFormError(null);
    setPendingAction("demo");
    try {
      const slug = await demoSignIn(resolveProfile);
      router.push(`/u/${slug}`);
      router.refresh();
    } catch {
      authPendingRef.current = false;
      setPendingAction(null);
      setFormError("signInError");
    }
  };
  const isPending = pendingAction !== null || formState.isSubmitting;

  return (
    <AccessShell
      title={t("welcomeBack")}
      footer={
        <Link href={signupHref} className="text-foreground hover:underline">
          {t("noAccount")}
        </Link>
      }>
      <Form
        form={formMethods}
        onSubmit={handleSubmit}
        className="grid gap-[0.7rem]"
        aria-busy={isPending}
        noValidate>
        <EmailField
          label={t("email")}
          placeholder={t("emailPlaceholder")}
          autoComplete="email"
          readOnly={isPending}
          required
          {...register("email")}
        />
        <div className="grid gap-1">
          <PasswordField
            id="login-password"
            label={t("password")}
            placeholder={t("passwordPlaceholder")}
            autoComplete="current-password"
            readOnly={isPending}
            required
            {...register("password")}
          />
          <Link
            href={forgotPasswordHref}
            className="text-folio-ink-soft inline-flex min-h-11 items-center justify-end text-sm underline decoration-folio-link underline-offset-[0.18em] hover:decoration-folio-coral">
            {t("forgotPassword")}
          </Link>
        </div>
        {formError ? (
          <p role="alert" className="text-destructive-text text-sm">
            {t(formError)}
          </p>
        ) : null}
        <Button
          type="submit"
          aria-disabled={isPending}
          aria-busy={pendingAction === "login"}
          className="h-12.5 min-h-12.5 w-full gap-2">
          {pendingAction === "login" ? <Spinner className="size-4" /> : null}
          {t("signIn")}
        </Button>
      </Form>
      <div className="border-border mt-5 border-t pt-5">
        <Button
          onClick={handleDemo}
          variant="ghost"
          aria-disabled={isPending}
          aria-busy={pendingAction === "demo"}
          className="h-12.5 min-h-12.5 w-full gap-2">
          {pendingAction === "demo" ? <Spinner className="size-4" /> : null}
          {t("exploreDemo")}
        </Button>
      </div>
      <p role="status" className="sr-only">
        {pendingAction === "demo" ? t("openingDemo") : pendingAction === "login" ? t("signingIn") : ""}
      </p>
    </AccessShell>
  );
}
