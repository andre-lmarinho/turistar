"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { registerWithPassword } from "@/features/auth/handlers/registerWithPassword";
import { buildEmailRedirectUrl, buildLoginHref, resolveNextPath } from "@/features/auth/lib/redirect";
import { validEmail } from "@/features/auth/utils/validEmail";
import { MIN_PASSWORD_LENGTH, validPassword } from "@/features/auth/utils/validPassword";
import { demoSignIn } from "@/features/demo/lib/demoSignIn";
import { normalizeUsername, validUsername } from "@/features/profile/utils/validUsername";
import { trpc } from "@/trpc/react";
import { Button } from "@/ui/components/button/Button";
import { EmailField, Form, PasswordField, TextField } from "@/ui/components/form";
import { ArrowRight, ChevronLeft, Map as MapIcon } from "@/ui/components/icon/lucide-icons";
import { Spinner } from "@/ui/components/loading/Spinner";

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

type AuthViewProps = {
  finalizeProfile: () => Promise<string>;
  nextPath?: string | null;
};

export function AuthView({ finalizeProfile, nextPath }: AuthViewProps) {
  const t = useTranslations();

  const router = useRouter();
  const safeNextPath = resolveNextPath(nextPath);
  const loginHref = buildLoginHref(safeNextPath);
  const [formError, setFormError] = useState<"signupError" | "signInError" | null>(null);
  const [confirmationRequired, setConfirmationRequired] = useState(false);
  const [pendingAction, setPendingAction] = useState<"signup" | "demo" | null>(null);
  const [signupOpen, setSignupOpen] = useState(false);
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

  useEffect(() => {
    if (signupOpen) formMethods.setFocus("username");
  }, [formMethods, signupOpen]);

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
    <main
      id="main-content"
      data-signup-open={signupOpen}
      className="mx-auto my-auto grid w-full max-w-384 grid-cols-[minmax(17rem,0.58fr)_minmax(0,1.42fr)] items-center gap-[clamp(2rem,4vw,4.5rem)] py-[clamp(1.75rem,4vw,3.5rem)] max-folio-wide:grid-cols-[minmax(15rem,0.62fr)_minmax(0,1.38fr)] max-folio-wide:gap-6 max-folio-tablet:max-w-100 max-folio-tablet:grid-cols-1 max-folio-tablet:gap-0 max-folio-tablet:pt-4 max-folio-tablet:pb-0 max-folio-phone:pt-3 max-folio-short:min-[34.01rem]:pt-[0.8rem] max-folio-short:min-[34.01rem]:pb-0">
      <section
        className="w-full min-w-0 max-w-100 max-folio-tablet:mx-auto"
        aria-label={signupOpen ? t("signupOpenTitle") : t("signupHeadline")}>
        <div className="relative isolate min-h-140 max-folio-short:min-[34.01rem]:min-h-136">
          <div
            data-active={!signupOpen}
            aria-hidden={signupOpen}
            inert={signupOpen}
            className="pointer-events-none absolute inset-0 flex -translate-x-3 flex-col justify-center opacity-0 transition-[opacity_180ms_ease,transform_320ms_cubic-bezier(0.22,1,0.36,1)] data-[active=true]:pointer-events-auto data-[active=true]:translate-x-0 data-[active=true]:opacity-100 data-[active=true]:delay-100 motion-reduce:transition-none">
            <h1
              id="signup-title"
              className="m-0 max-w-[11ch] font-folio-display text-[clamp(3rem,4.8vw,4.8rem)] font-medium leading-[0.95] tracking-[-0.045em] text-folio-ink text-balance max-folio-wide:text-[clamp(2.6rem,5vw,4rem)] max-folio-tablet:max-w-[12ch] max-folio-tablet:text-[clamp(2.75rem,8vw,3.4rem)] max-folio-phone:text-[clamp(2.6rem,11vw,3rem)] max-folio-short:min-[34.01rem]:text-[clamp(2.3rem,4.4vw,3.7rem)]">
              {t("signupHeadline")}
            </h1>
            <p className="mt-[1.2rem] max-w-[37ch] text-base leading-[1.6] text-folio-ink-soft max-folio-phone:mt-3 max-folio-phone:text-[0.9rem] max-folio-phone:leading-[1.45] max-folio-short:min-[34.01rem]:mt-[0.7rem] max-folio-short:min-[34.01rem]:leading-[1.4]">
              {t("signupDescription")}
            </p>
            <div className="mt-7 grid w-full max-w-100 gap-[0.7rem] max-folio-phone:mt-5 max-folio-phone:gap-[0.65rem] max-folio-short:min-[34.01rem]:mt-[1.1rem]">
              <Button
                variant="accent"
                onClick={handleDemo}
                aria-disabled={isPending}
                aria-busy={pendingAction === "demo"}
                className="relative h-12.5 min-h-12.5 w-full justify-center rounded border border-folio-citron bg-folio-citron px-4 text-[0.9rem] font-[680] text-folio-ink transition-[background-color,border-color,color,transform] duration-150 hover:border-folio-citron-hover hover:bg-folio-citron-hover active:scale-[0.985] motion-reduce:transition-none">
                {pendingAction === "demo" ? <Spinner className="absolute left-4 size-4" /> : null}
                <span className="flex w-full items-center justify-center gap-2">
                  <span className="whitespace-nowrap">{t("exploreDemo")}</span>
                  <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
                </span>
              </Button>
              <p className="-mt-1 max-w-[34ch] text-[0.78rem] leading-[1.45] text-folio-ink-soft">
                {t("demoAccessNote")}
              </p>
              <Button
                type="button"
                variant="ghost"
                aria-expanded={signupOpen}
                aria-controls="signup-fields"
                aria-disabled={isPending}
                onClick={() => {
                  if (!isPending) setSignupOpen(true);
                }}
                className="h-12.5 min-h-12.5 w-full">
                {t("createAccount")}
              </Button>
            </div>
            <div className="mt-[0.9rem] grid gap-[0.45rem] text-[0.78rem] leading-[1.45] text-folio-ink-soft max-folio-phone:mt-[0.65rem] max-folio-phone:text-[0.72rem] [&_p]:m-0">
              <p>
                {t.rich("existingAccount", {
                  login: (chunks) => (
                    <Link
                      href={loginHref}
                      className="font-[650] text-folio-ink underline decoration-folio-link underline-offset-[0.18em] hover:decoration-folio-coral focus-visible:outline-[3px] focus-visible:outline-folio-coral focus-visible:outline-offset-[3px]">
                      {chunks}
                    </Link>
                  ),
                })}
              </p>
            </div>
          </div>

          <div
            data-active={signupOpen}
            aria-hidden={!signupOpen}
            inert={!signupOpen}
            className="pointer-events-none absolute inset-0 flex translate-x-3 flex-col justify-center opacity-0 transition-[opacity_180ms_ease,transform_320ms_cubic-bezier(0.22,1,0.36,1)] data-[active=true]:pointer-events-auto data-[active=true]:translate-x-0 data-[active=true]:opacity-100 data-[active=true]:delay-100 motion-reduce:transition-none">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setSignupOpen(false)}
              className="mb-[0.8rem] min-h-7 w-fit justify-start gap-2 border-0 bg-transparent px-2 py-1 text-[0.83rem] font-medium text-folio-ink-soft hover:bg-folio-ink/5 hover:text-folio-ink max-folio-phone:mb-[0.65rem]">
              <ChevronLeft aria-hidden="true" />
              {t("signupBackToChoices")}
            </Button>
            <h1 className="m-0 max-w-[11ch] font-folio-display text-[clamp(3rem,4.8vw,4.8rem)] font-medium leading-[0.95] tracking-[-0.045em] text-folio-ink text-balance max-folio-wide:text-[clamp(2.6rem,5vw,4rem)] max-folio-tablet:max-w-[12ch] max-folio-tablet:text-[clamp(2.75rem,8vw,3.4rem)] max-folio-phone:text-[clamp(2.6rem,11vw,3rem)] max-folio-short:min-[34.01rem]:text-[clamp(2.3rem,4.4vw,3.7rem)]">
              {t("signupOpenTitle")}
            </h1>
            <p className="mt-[1.2rem] max-w-[37ch] text-base leading-[1.6] text-folio-ink-soft max-folio-phone:mt-3 max-folio-phone:text-[0.9rem] max-folio-phone:leading-[1.45] max-folio-short:min-[34.01rem]:mt-[0.7rem] max-folio-short:min-[34.01rem]:leading-[1.4]">
              {t("signupOpenDescription")}
            </p>
            <Button
              type="button"
              variant="ghost"
              onClick={handleDemo}
              aria-disabled={isPending}
              aria-busy={pendingAction === "demo"}
              className="mb-0 mt-1 h-12.5 min-h-12.5 w-full">
              {pendingAction === "demo" ? <Spinner className="size-4" /> : null}
              {t("exploreDemo")}
            </Button>

            <Form
              id="signup-fields"
              form={formMethods}
              onSubmit={handleSubmit}
              className="mt-[0.85rem]"
              aria-busy={isPending}
              noValidate>
              <div className="grid gap-[0.7rem] max-folio-phone:gap-[0.65rem]">
                <div className="min-w-0">
                  <TextField
                    id="signup-username"
                    label={t("username")}
                    placeholder=" "
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
                    className={
                      usernameStatus === "checking" ? "mt-1 text-[0.76rem] text-folio-ink-soft" : "sr-only"
                    }>
                    {usernameStatus === "checking" ? t("checkingUsername") : ""}
                  </p>
                </div>
                <div className="min-w-0">
                  <EmailField
                    id="signup-email"
                    label={t("email")}
                    placeholder={t("emailPlaceholder")}
                    autoComplete="email"
                    readOnly={isPending}
                    required
                    {...register("email")}
                  />
                </div>
                <div className="min-w-0">
                  <PasswordField
                    id="signup-password"
                    label={t("password")}
                    placeholder={t("createPasswordPlaceholder")}
                    autoComplete="new-password"
                    minLength={MIN_PASSWORD_LENGTH}
                    readOnly={isPending}
                    required
                    {...register("password")}
                  />
                </div>
              </div>
              {confirmationRequired ? (
                <p role="status" className="mt-[0.8rem] text-[0.85rem] leading-[1.4] text-folio-error">
                  {t("signupConfirmation")}
                </p>
              ) : null}
              <Button
                type="submit"
                aria-disabled={isPending}
                aria-busy={pendingAction === "signup"}
                className="mt-3 h-12.5 min-h-12.5 w-full max-folio-phone:mt-[0.6rem]">
                {pendingAction === "signup" ? <Spinner className="size-4" /> : null}
                {t("createAccount")}
              </Button>
              <div className="mt-[0.65rem] grid gap-[0.45rem] text-[0.78rem] leading-[1.45] text-folio-ink-soft max-folio-phone:mt-[0.55rem] max-folio-phone:text-[0.7rem] [&_p]:m-0">
                <p>
                  {t.rich("termsAgreement", {
                    terms: (chunks) => (
                      <Link
                        href="/terms"
                        className="font-[650] text-folio-ink underline decoration-folio-link underline-offset-[0.18em] hover:decoration-folio-coral focus-visible:outline-[3px] focus-visible:outline-folio-coral focus-visible:outline-offset-[3px]">
                        {chunks}
                      </Link>
                    ),
                    privacy: (chunks) => (
                      <Link
                        href="/privacy"
                        className="font-[650] text-folio-ink underline decoration-folio-link underline-offset-[0.18em] hover:decoration-folio-coral focus-visible:outline-[3px] focus-visible:outline-folio-coral focus-visible:outline-offset-[3px]">
                        {chunks}
                      </Link>
                    ),
                  })}
                </p>
              </div>
            </Form>
            <div className="mt-[0.9rem] grid gap-[0.45rem] text-[0.78rem] leading-[1.45] text-folio-ink-soft max-folio-phone:mt-[0.65rem] max-folio-phone:text-[0.72rem] [&_p]:m-0">
              <p>
                {t.rich("existingAccount", {
                  login: (chunks) => (
                    <Link
                      href={loginHref}
                      className="font-[650] text-folio-ink underline decoration-folio-link underline-offset-[0.18em] hover:decoration-folio-coral focus-visible:outline-[3px] focus-visible:outline-folio-coral focus-visible:outline-offset-[3px]">
                      {chunks}
                    </Link>
                  ),
                })}
              </p>
            </div>
          </div>
        </div>
        {formError ? (
          <p role="alert" className="mt-[0.8rem] text-[0.85rem] leading-[1.4] text-folio-error">
            {t(formError)}
          </p>
        ) : null}
        <p role="status" className="sr-only">
          {pendingAction === "demo"
            ? t("openingDemo")
            : pendingAction === "signup"
              ? t("creatingAccount")
              : ""}
        </p>
      </section>
      <figure className="w-[min(100%,calc(58vh*1.3333))] min-w-0 justify-self-end border border-folio-ink/15 bg-folio-paper p-[clamp(0.75rem,1.5vw,1.15rem)] text-folio-ink shadow-[0_1.5rem_4rem_rgb(5_25_22/25%)] max-folio-tablet:hidden">
        <div className="flex items-center justify-between gap-4 px-1 pb-[0.85rem] pt-[0.2rem]">
          <span className="text-[0.72rem] font-bold uppercase tracking-widest text-folio-ink">
            {t("signupPreviewLabel")}
          </span>
        </div>
        <div
          className="grid aspect-4/3 w-full place-items-center border border-dashed border-folio-preview-line bg-folio-preview-surface bg-[radial-gradient(var(--folio-preview-dot)_0.8px,transparent_0.8px)] bg-center bg-size-[18px_18px]"
          role="img"
          aria-label={t("signupPreviewAlt")}>
          <div className="grid justify-items-center gap-[0.8rem] p-6 text-center">
            <span
              className="grid size-13 place-items-center rounded-full border border-folio-preview-dot bg-folio-white text-folio-ink [&_svg]:size-[1.35rem] [&_svg]:stroke-[1.7]"
              aria-hidden="true">
              <MapIcon />
            </span>
            <span className="text-[0.78rem] font-[750] uppercase tracking-[0.12em] text-folio-ink">
              {t("signupPreviewPlaceholder")}
            </span>
            <span className="text-[0.85rem] leading-[1.45] text-folio-ink-soft">
              {t("signupPreviewImageNote")}
            </span>
          </div>
        </div>
      </figure>
    </main>
  );
}
