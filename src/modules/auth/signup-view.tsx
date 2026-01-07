"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AUTH_ERROR_MESSAGES, getAuthErrorMessage } from "@/features/auth/lib/error-messages";
import { buildEmailRedirectUrl, buildLoginHref, resolveNextPath } from "@/features/auth/lib/redirect";
import { registerWithPassword } from "@/features/auth/signup/handlers/registerWithPassword";
import { Button } from "@/shared/ui/button/Button";
import { EmailField, Form, PasswordField } from "@/shared/ui/form";
import type { LucideIcon } from "@/shared/ui/icon/lucide-icons";
import { Kanban, LandPlot, Plane } from "@/shared/ui/icon/lucide-icons";

import mock from "./media/app-mock.webp";

const signupSchema = z.object({
  email: z.string().min(1, "Email is required.").email("Enter a valid email."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type SignupValues = z.infer<typeof signupSchema>;

const DEFAULT_VALUES: SignupValues = {
  email: "",
  password: "",
};

type SignupViewProps = {
  finalizeProfile: () => Promise<string>;
  nextPath?: string | null;
};

type SignupFeature = {
  Icon: LucideIcon;
  title: string;
  description: string;
};

const FEATURES: SignupFeature[] = [
  {
    Icon: Plane,
    title: "Build your full itinerary",
    description: "Create and organize travel days with activities, schedules, and personal notes.",
  },
  {
    Icon: Kanban,
    title: "Drag and drop your ideas",
    description: "Rearrange days and activities with an intuitive visual interface.",
  },
  {
    Icon: LandPlot,
    title: "See everything in one place",
    description: "View your plan, budget, and map in a single integrated view.",
  },
];

export function SignupView({ finalizeProfile, nextPath }: SignupViewProps) {
  const router = useRouter();
  const safeNextPath = resolveNextPath(nextPath);
  const loginHref = buildLoginHref(safeNextPath);
  const [formError, setFormError] = useState<string | null>(null);

  const formMethods = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const { register, formState } = formMethods;

  const handleSubmit: SubmitHandler<SignupValues> = async (values) => {
    setFormError(null);

    try {
      const emailRedirectTo = buildEmailRedirectUrl(safeNextPath, window.location.origin);
      const result = await registerWithPassword({
        email: values.email,
        password: values.password,
        finalizeProfile,
        emailRedirectTo,
      });

      if (result.status === "needs-confirmation") {
        setFormError(AUTH_ERROR_MESSAGES.signUp.needsConfirmation);
        return;
      }

      router.push(safeNextPath ?? `/u/${result.slug}/planners`);
      router.refresh();
    } catch (error) {
      setFormError(getAuthErrorMessage(error, AUTH_ERROR_MESSAGES.signUp.fallback));
    }
  };

  return (
    <div className="bg-card flex min-h-screen w-full flex-col items-center justify-center">
      <div className="2xl:border-border bg-background grid w-full max-w-360 grid-cols-1 grid-rows-1 overflow-hidden lg:grid-cols-2 2xl:rounded-[20px] 2xl:border 2xl:py-6">
        <div className="mt-0 mr-auto ml-auto flex w-full max-w-xl flex-col px-4 pt-6 md:px-20 lg:mt-24 2xl:px-28">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">Start your planning</h1>
            <p className="text-muted-foreground text-base font-medium">
              Create your free plan, invite friends, and keep every detail organized in one place.
            </p>
          </div>
          <Form form={formMethods} onSubmit={handleSubmit} className="mt-12 grid gap-6" noValidate>
            <EmailField
              label="Email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              {...register("email")}
            />
            <PasswordField
              label="Password"
              placeholder="Create a strong password"
              autoComplete="new-password"
              minLength={6}
              required
              {...register("password")}
            />
            {formError ? (
              <p role="alert" className="text-destructive text-sm">
                {formError}
              </p>
            ) : null}
            <Button type="submit" disabled={formState.isSubmitting} className="text-base font-semibold">
              {formState.isSubmitting ? "Creating account..." : "Create account"}
            </Button>
          </Form>
          <div className="text-muted-foreground mt-10 flex h-full flex-col justify-end pb-6 text-sm">
            <p>
              {"Already have an account? "}
              <Link href={loginHref} className="text-foreground hover:underline">
                Log in
              </Link>
            </p>
            <p>
              {"By continuing, you agree to our "}
              <Link href="/terms" className="text-foreground hover:underline">
                Terms
              </Link>
              {" and "}
              <Link href="/privacy" className="text-foreground hover:underline">
                Privacy Policy
              </Link>
              {"."}
            </p>
          </div>
        </div>
        <div className="border-border lg:bg-muted/30 mx-auto mt-24 w-full max-w-2xl flex-col justify-between rounded-l-2xl pl-4 lg:mt-0 lg:flex lg:max-w-full lg:border lg:py-12 lg:pl-12">
          <div className="border-default bg-muted/30 hidden rounded-tl-2xl rounded-br-none rounded-bl-2xl border border-r-0 border-dashed lg:block lg:py-1.5 lg:pl-1.5">
            <Image src={mock} alt="" className="block" aria-hidden="true" width={681} height={520} />
          </div>
          <div className="mt-8 mr-12 hidden h-full w-full grid-cols-3 gap-4 overflow-hidden lg:grid">
            {FEATURES.map(({ Icon, title, description }) => (
              <div key={title} className="mb-8 flex max-w-52 flex-col leading-none sm:mb-0">
                <div className="items-center">
                  <Icon className="size-4" aria-hidden="true" />
                  <span className="text-sm font-medium">{title}</span>
                </div>
                <div className="text-muted-foreground text-sm">
                  <p>{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
