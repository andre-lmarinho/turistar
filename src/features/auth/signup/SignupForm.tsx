'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/shared/ui/button';
import { supabase } from '@/shared/lib/supabaseClient';
import { syncServerSession } from '@/shared/lib/auth/sync-server-session';
import type { AuthResponse } from '@supabase/auth-js';
import type { Session } from '@supabase/supabase-js';

type SignupFormProps = {
  finalizeProfile: () => Promise<string>;
  nextPath?: string;
};

export function SignupForm({ finalizeProfile, nextPath }: SignupFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const safeNextPath =
    nextPath && nextPath.startsWith('/') && !nextPath.startsWith('//') ? nextPath : null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!email.trim() || !password.trim()) {
      setFormError('Email and password are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const redirectTo = safeNextPath
        ? new URL(safeNextPath, window.location.origin).toString()
        : undefined;
      const { data, error } = (await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
      })) as AuthResponse;

      if (error) {
        throw new Error(error.message);
      }

      const session: Session | null = data.session
        ? { ...data.session, expires_at: data.session.expires_at ?? null }
        : null;

      if (!session) {
        setFormError('Check your email to confirm your account before signing in.');
        setIsSubmitting(false);
        return;
      }

      await syncServerSession('SIGNED_IN', session);

      const slug = await finalizeProfile();
      router.push(safeNextPath ?? `/u/${slug}/planners`);
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to create your account.');
      setIsSubmitting(false);
    }
  };

  return (
    <form className="mt-12 grid gap-6" onSubmit={handleSubmit} noValidate>
      <label className="text-foreground grid gap-1 text-sm font-medium">
        Email
        <input
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="border-input focus-visible:ring-ring focus-visible:ring-offset-background bg-background rounded-md border px-3 py-2 text-base shadow-sm focus-visible:ring-2 focus-visible:outline-none"
          placeholder="you@example.com"
          required
        />
      </label>
      <label className="text-foreground grid gap-1 text-sm font-medium">
        Password
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="border-input focus-visible:ring-ring focus-visible:ring-offset-background bg-background rounded-md border px-3 py-2 text-base shadow-sm focus-visible:ring-2 focus-visible:outline-none"
          placeholder="Create a strong password"
          minLength={6}
          required
        />
      </label>
      {formError ? (
        <p role="alert" className="text-destructive text-sm">
          {formError}
        </p>
      ) : null}
      <Button type="submit" disabled={isSubmitting} className="text-base font-semibold">
        {isSubmitting ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  );
}
