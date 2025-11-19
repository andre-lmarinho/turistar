import Link from 'next/link';

import { LoginForm } from './LoginForm';

type LoginPageProps = {
  resolveProfile: () => Promise<string>;
};

export function LoginPage({ resolveProfile }: LoginPageProps) {
  return (
    <div className="bg-card flex min-h-screen items-center justify-center px-2">
      <div className="flex w-full max-w-md flex-col gap-6">
        <h1 className="text-center text-3xl font-semibold tracking-tight">Welcome back</h1>
        <div className="border-border bg-background rounded-2xl border px-4 py-10 sm:px-10">
          <LoginForm resolveProfile={resolveProfile} />
        </div>
        <p className="text-muted-foreground text-center text-sm">
          <Link href="/signup" className="text-foreground hover:underline">
            Don't have an account?
          </Link>
        </p>
      </div>
    </div>
  );
}
