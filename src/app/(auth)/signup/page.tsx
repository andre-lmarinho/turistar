import { redirect } from "next/navigation";
import { ensureProfile } from "@/features/auth/lib/ensureProfile";
import { resolveNextPath } from "@/features/auth/lib/redirect";
import { SignupView } from "@/modules/auth/signup-view";
import { getCurrentUser } from "@/shared/lib/auth/session";

export default async function SignupRoute({ searchParams }: { searchParams?: Promise<{ next?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const nextPath = resolveNextPath(resolvedSearchParams?.next);
  const user = await getCurrentUser();

  if (user) {
    const slug = await ensureProfile();
    redirect(nextPath ?? `/u/${slug}/planners`);
  }

  async function finalizeProfileAction() {
    "use server";
    return ensureProfile();
  }

  return <SignupView finalizeProfile={finalizeProfileAction} nextPath={nextPath} />;
}
