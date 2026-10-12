"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useId, useRef, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { registerWithPassword } from "@/features/auth/handlers/registerWithPassword";
import { buildEmailRedirectUrl, buildLoginHref, resolveNextPath } from "@/features/auth/lib/redirect";
import { validEmail } from "@/features/auth/utils/validEmail";
import { MIN_PASSWORD_LENGTH, validPassword } from "@/features/auth/utils/validPassword";
import { demoSignIn } from "@/features/demo/lib/demoSignIn";
import { normalizeUsername, validUsername } from "@/features/profile/utils/validUsername";
import { LanguageSelect } from "@/modules/auth/components/LanguageSelect";
import { trpc } from "@/trpc/react";
import { Button } from "@/ui/components/button/Button";
import { EmailField, Form, PasswordField, TextField } from "@/ui/components/form";
import type { LucideIcon } from "@/ui/components/icon/lucide-icons";
import { Kanban, LandPlot, Plane } from "@/ui/components/icon/lucide-icons";
import { Spinner } from "@/ui/components/loading/Spinner";

import mock from "./media/app-mock.webp";

const signupSchema = z.object({
  username: z.string().min(1, "usernameRequired").refine(validUsername, "usernameInvalid"),
  email: z.string().min(1, "emailRequired").refine(validEmail, "emailInvalid"),
  password: z.string().refine(validPassword, "passwordMinLength"),
});

type SignupValues = { username: string; email: string; password: string };

const DEFAULT_VALUES: SignupValues = {
  username: "",
  email: "",
  password: "",
};

type SignupViewProps = {
  finalizeProfile: () => Promise<string>;
  nextPath?: string | null;
};

type SignupFeature = {
  Icon: LucideIcon;
  title: "itineraryFeatureTitle" | "organizeFeatureTitle" | "overviewFeatureTitle";
  description: "itineraryFeatureDescription" | "organizeFeatureDescription" | "overviewFeatureDescription";
};

const FEATURES: SignupFeature[] = [
  {
    Icon: Plane,
    title: "itineraryFeatureTitle",
    description: "itineraryFeatureDescription",
  },
  {
    Icon: Kanban,
    title: "organizeFeatureTitle",
    description: "organizeFeatureDescription",
  },
  {
    Icon: LandPlot,
    title: "overviewFeatureTitle",
    description: "overviewFeatureDescription",
  },
];

export function SignupView({ finalizeProfile, nextPath }: SignupViewProps) {
  const t = useTranslations();

  const router = useRouter();
  const safeNextPath = resolveNextPath(nextPath);
  const loginHref = buildLoginHref(safeNextPath);
  const [formError, setFormError] = useState<"signupError" | "signInError" | null>(null);
  const [confirmationRequired, setConfirmationRequired] = useState(false);
  const [pendingAction, setPendingAction] = useState<"signup" | "demo" | null>(null);
  const authPendingRef = useRef(false);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking">("idle");
  const usernameCheckIdRef = useRef(0);
  const usernameStatusId = useId();
  const profileUtils = trpc.useUtils();

  const formMethods = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const { register, formState, setError, clearErrors, getValues } = formMethods;

  async function checkUsername(rawUsername: string, focusError = false): Promise<boolean> {
    const checkId = ++usernameCheckIdRef.current;
    const normalized = normalizeUsername(rawUsername);

    if (!normalized) {
      setUsernameStatus("idle");
      clearErrors("username");
      return false;
    }

    if (!validUsername(normalized)) {
      setUsernameStatus("idle");
      setError("username", { message: "usernameInvalid" }, { shouldFocus: focusError });
      return false;
    }

    setUsernameStatus("checking");
    clearErrors("username");

    try {
      const { available } = await profileUtils.public.profile.availability.fetch({ username: normalized });

      const currentNormalized = normalizeUsername(getValues("username") ?? "");
      if (currentNormalized !== normalized || checkId !== usernameCheckIdRef.current) {
        return false;
      }

      if (available) {
        setUsernameStatus("idle");
        clearErrors("username");
        return true;
      }

      setUsernameStatus("idle");
      setError("username", { message: "usernameTaken" }, { shouldFocus: focusError });
      return false;
    } catch {
      if (checkId !== usernameCheckIdRef.current) return false;
      setUsernameStatus("idle");
      setError("username", { message: "usernameCheckFailed" }, { shouldFocus: focusError });
      return false;
    }
  }

  const handleSubmit: SubmitHandler<SignupValues> = async (values) => {
    if (authPendingRef.current) return;
    authPendingRef.current = true;
    setPendingAction("signup");
    setFormError(null);
    setConfirmationRequired(false);

    try {
      const isAvailable = await checkUsername(values.username, true);
      if (!isAvailable) {
        authPendingRef.current = false;
        setPendingAction(null);
        return;
      }

      const emailRedirectTo = buildEmailRedirectUrl(safeNextPath, window.location.origin);
      const result = await registerWithPassword({
        username: normalizeUsername(values.username),
        email: values.email,
        password: values.password,
        finalizeProfile,
        emailRedirectTo,
      });

      if (result.status === "needs-confirmation") {
        setConfirmationRequired(true);
        authPendingRef.current = false;
        setPendingAction(null);
        return;
      }

      router.push(safeNextPath ?? `/u/${result.slug}`);
      router.refresh();
    } catch {
      authPendingRef.current = false;
      setPendingAction(null);
      setFormError("signupError");
    }
  };

  const isPending = pendingAction !== null || formState.isSubmitting;

  const handleDemo = async () => {
    if (authPendingRef.current || formState.isSubmitting) return;

    authPendingRef.current = true;
    setFormError(null);
    setConfirmationRequired(false);
    setPendingAction("demo");
    try {
      const slug = await demoSignIn(finalizeProfile);
      router.push(`/u/${slug}`);
      router.refresh();
    } catch {
      authPendingRef.current = false;
      setPendingAction(null);
      setFormError("signInError");
    }
  };

  const usernameField = register("username", {
    onBlur: () => {
      if (authPendingRef.current) return;
      void checkUsername(getValues("username") ?? "");
    },
    onChange: () => {
      usernameCheckIdRef.current++;
      setUsernameStatus("idle");
      clearErrors("username");
    },
  });

  return (
    <main id="main-content" className="py-12 bg-card flex min-h-screen flex-col items-stretch justify-center">
      <LanguageSelect />
      <div className="2xl:border-border items-center 2xl:bg-background grid w-full max-w-360 mx-auto grid-cols-1 grid-rows-1 overflow-hidden lg:grid-cols-2 2xl:rounded-[20px] 2xl:border 2xl:py-6">
        <div className="mt-0 mr-auto ml-auto flex w-full max-w-xl flex-col px-4 pt-6 md:px-20 lg:mt-24 2xl:px-28">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">{t("startPlanning")}</h1>
            <p className="text-muted-foreground text-base font-medium">{t("signupDescription")}</p>
          </div>
          <Form
            form={formMethods}
            onSubmit={handleSubmit}
            className="mt-12 grid gap-6"
            aria-busy={isPending}
            noValidate>
            <div>
              <TextField
                label={t("username")}
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                aria-describedby={usernameStatusId}
                readOnly={isPending}
                required
                {...usernameField}
              />
              <p
                id={usernameStatusId}
                role="status"
                className={usernameStatus === "checking" ? "text-muted-foreground mt-2 text-sm" : "sr-only"}>
                {usernameStatus === "checking" ? t("checkingUsername") : ""}
              </p>
            </div>
            <EmailField
              label={t("email")}
              placeholder={t("emailPlaceholder")}
              autoComplete="email"
              readOnly={isPending}
              required
              {...register("email")}
            />
            <PasswordField
              label={t("password")}
              placeholder={t("createPasswordPlaceholder")}
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              readOnly={isPending}
              required
              {...register("password")}
            />
            {formError ? (
              <p role="alert" className="text-destructive text-sm">
                {t(formError)}
              </p>
            ) : null}
            {confirmationRequired ? (
              <p role="status" className="text-muted-foreground text-sm">
                {t("signupConfirmation")}
              </p>
            ) : null}
            <Button
              type="submit"
              disabled={isPending}
              aria-busy={pendingAction === "signup"}
              className="min-h-11 gap-2 text-base font-semibold">
              {pendingAction === "signup" ? <Spinner className="size-4" /> : null}
              {t("createAccount")}
            </Button>
          </Form>
          <div className="mt-5">
            <Button
              variant="accent"
              onClick={handleDemo}
              disabled={isPending}
              aria-busy={pendingAction === "demo"}
              className="w-full gap-2 py-3 text-base font-semibold shadow-sm transition-colors">
              {pendingAction === "demo" ? <Spinner className="size-4" /> : null}
              {t("exploreDemo")}
            </Button>
          </div>
          <p role="status" className="sr-only">
            {pendingAction === "demo"
              ? t("openingDemo")
              : pendingAction === "signup"
                ? t("creatingAccount")
                : ""}
          </p>
          <div className="text-muted-foreground mt-10 flex h-full flex-col justify-end pb-6 text-sm">
            <p>
              {t.rich("existingAccount", {
                login: (chunks) => (
                  <Link href={loginHref} className="text-foreground hover:underline">
                    {chunks}
                  </Link>
                ),
              })}
            </p>
            <p>
              {t.rich("termsAgreement", {
                terms: (chunks) => (
                  <Link href="/terms" className="text-foreground hover:underline">
                    {chunks}
                  </Link>
                ),
                privacy: (chunks) => (
                  <Link href="/privacy" className="text-foreground hover:underline">
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          </div>
        </div>
        <div className="border-border lg:bg-muted/30 mx-auto hidden w-full max-w-2xl flex-col justify-between rounded-l-2xl pl-4 lg:flex lg:max-w-full lg:border lg:py-12 lg:pl-12">
          <div className="border-default bg-muted/30 hidden rounded-tl-2xl rounded-br-none rounded-bl-2xl border border-r-0 border-dashed lg:block lg:py-1.5 lg:pl-1.5">
            <Image src={mock} alt="" className="block" aria-hidden="true" width={681} height={520} />
          </div>
          <div className="mt-8 mr-12 hidden h-full w-full grid-cols-3 gap-4 overflow-hidden lg:grid">
            {FEATURES.map(({ Icon, title, description }) => (
              <div key={title} className="mb-8 flex max-w-52 flex-col leading-none sm:mb-0">
                <div className="items-center">
                  <Icon className="size-4" aria-hidden="true" />
                  <span className="text-sm font-medium">{t(title)}</span>
                </div>
                <div className="text-muted-foreground text-sm">
                  <p>{t(description)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
