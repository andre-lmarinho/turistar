"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { AuthResponse } from "@supabase/auth-js";
import type { Session } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AUTH_ERROR_MESSAGES, getAuthErrorMessage } from "@/features/auth/lib/error-messages";
import { buildSignupHref, resolveNextPath } from "@/features/auth/lib/redirect";
import { syncServerSession } from "@/shared/lib/auth/sync-server-session";
import { supabase } from "@/shared/lib/supabaseClient";
import { Button } from "@/shared/ui/button/Button";
import { EmailField, Form, PasswordField } from "@/shared/ui/form";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required.").email("Enter a valid email."),
  password: z.string().min(1, "Password is required."),
});

type LoginValues = z.infer<typeof loginSchema>;

const DEFAULT_VALUES: LoginValues = {
  email: "",
  password: "",
};

type LoginViewProps = {
  resolveProfile: () => Promise<string>;
  nextPath?: string | null;
};

type PasswordSignInInput = {
  email: string;
  password: string;
  resolveProfile: () => Promise<string>;
};

type PasswordSignInResult = {
  slug: string;
};

type ProfileSlugRecord = {
  slug: string | null;
};

function getErrorMessage(error: unknown): string | null {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }
  return null;
}

async function performPasswordSignIn({
  email,
  password,
  resolveProfile,
}: PasswordSignInInput): Promise<PasswordSignInResult> {
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  const { data, error } = (await supabase.auth.signInWithPassword({
    email: trimmedEmail,
    password: trimmedPassword,
  })) as AuthResponse;

  if (error) {
    throw new Error(`signIn failed: message=${error.message}`);
  }

  const session: Session | null = data.session ?? null;

  if (!session) {
    throw new Error(`signIn failed: reason=no_session`);
  }

  await syncServerSession("SIGNED_IN", session);

  const userId = session.user?.id;

  if (!userId) {
    return { slug: await resolveProfile() };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select<ProfileSlugRecord>("slug")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    const message = getErrorMessage(profileError) ?? "unknown";
    throw new Error(`getProfileSlug failed: userId=${userId} message=${message}`);
  }

  if (profile?.slug) {
    return { slug: profile.slug };
  }

  return { slug: await resolveProfile() };
}

export function LoginView({ resolveProfile, nextPath }: LoginViewProps) {
  const router = useRouter();
  const safeNextPath = resolveNextPath(nextPath);
  const signupHref = buildSignupHref(safeNextPath);
  const [formError, setFormError] = useState<string | null>(null);

  const formMethods = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const { register, formState } = formMethods;

  const handleSubmit: SubmitHandler<LoginValues> = async (values) => {
    setFormError(null);

    try {
      const { slug } = await performPasswordSignIn({
        email: values.email,
        password: values.password,
        resolveProfile,
      });

      router.push(safeNextPath ?? `/u/${slug}/planners`);
      router.refresh();
    } catch (error) {
      setFormError(getAuthErrorMessage(error, AUTH_ERROR_MESSAGES.signIn.fallback));
    }
  };

  return (
    <div className="bg-card flex min-h-screen items-center justify-center px-2">
      <div className="flex w-full max-w-md flex-col gap-6">
        <h1 className="text-center text-3xl font-semibold tracking-tight">Welcome back</h1>
        <div className="border-border bg-background rounded-2xl border px-4 py-10 sm:px-10">
          <Form form={formMethods} onSubmit={handleSubmit} className="grid gap-6" noValidate>
            <EmailField
              label="Email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              {...register("email")}
            />
            <PasswordField
              label="Password"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              {...register("password")}
            />
            {formError ? (
              <p role="alert" className="text-destructive text-sm">
                {formError}
              </p>
            ) : null}
            <Button type="submit" disabled={formState.isSubmitting} className="text-base font-semibold">
              {formState.isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </Form>
        </div>
        <p className="text-muted-foreground text-center text-sm">
          <Link href={signupHref} className="text-foreground hover:underline">
            Don't have an account?
          </Link>
        </p>
      </div>
    </div>
  );
}
