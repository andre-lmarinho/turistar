import Link from 'next/link';

import { LoginForm } from './LoginForm';

type LoginPageProps = {
  resolveProfile: () => Promise<string>;
};

export function LoginPage({ resolveProfile }: LoginPageProps) {
  return (
    <div className="bg-card flex min-h-screen items-center justify-center px-4">
      <div className="bg-background w-full max-w-lg rounded-2xl p-8 shadow-sm sm:p-10">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
        </div>
        <LoginForm resolveProfile={resolveProfile} />
        <p className="text-muted-foreground mt-8 text-center text-sm">
          <Link href="/signup" className="text-foreground hover:underline">
            Don't have an account?
          </Link>
        </p>
      </div>
    </div>
  );
}
