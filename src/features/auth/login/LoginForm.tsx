'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/shared/ui/button';
import { supabase } from '@/shared/lib/supabaseClient';
import { syncServerSession } from '@/shared/lib/auth/sync-server-session';
import type { AuthResponse } from '@supabase/auth-js';
import type { Session } from '@supabase/supabase-js';

type LoginFormProps = {
  resolveProfile: () => Promise<string>;
};

export function LoginForm({ resolveProfile }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!email.trim() || !password.trim()) {
      setFormError('Email and password are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = (await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      })) as AuthResponse;

      if (error) {
        throw new Error(error.message);
      }

      const session: Session | null = data.session
        ? { ...data.session, expires_at: data.session.expires_at ?? null }
        : null;

      if (!session) {
        throw new Error('No session returned from Supabase. Please verify your credentials.');
      }

      // Fire-and-forget to avoid blocking the UI if the callback is slow.
      void syncServerSession('SIGNED_IN', session);

      const slug = await resolveProfile();
      router.push(`/u/${slug}/planners`);
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to sign you in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="grid gap-6" onSubmit={handleSubmit} noValidate>
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
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="border-input focus-visible:ring-ring focus-visible:ring-offset-background bg-background rounded-md border px-3 py-2 text-base shadow-sm focus-visible:ring-2 focus-visible:outline-none"
          placeholder="Enter your password"
          required
        />
      </label>
      {formError ? (
        <p role="alert" className="text-sm text-[var(--destructive)]">
          {formError}
        </p>
      ) : null}
      <Button type="submit" disabled={isSubmitting} className="text-base font-semibold">
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}
