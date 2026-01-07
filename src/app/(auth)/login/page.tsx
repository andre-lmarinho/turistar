import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ensureProfile } from "@/features/auth/lib/ensureProfile";
import { resolveNextPath } from "@/features/auth/lib/redirect";
import { LoginView } from "@/modules/auth/login-view";
import { getCurrentUser } from "@/shared/lib/auth/session";

export const metadata: Metadata = {
  title: "Login | Turistar App",
};

export default async function LoginRoute({ searchParams }: { searchParams?: Promise<{ next?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const nextPath = resolveNextPath(resolvedSearchParams?.next);
  const user = await getCurrentUser();

  if (user) {
    const slug = await ensureProfile();
    redirect(nextPath ?? `/u/${slug}/planners`);
  }

  async function resolveProfileAction() {
    "use server";
    return ensureProfile();
  }

  return <LoginView resolveProfile={resolveProfileAction} nextPath={nextPath} />;
}
