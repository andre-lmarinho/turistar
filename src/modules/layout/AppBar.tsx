import { getViewer } from "@/features/auth/lib/session";
import { ProfileRepository } from "@/features/profile/repositories/ProfileRepository";
import { createSupabaseServerClient } from "@/supabase/server";
import { Logo } from "@/ui/components/logo";

import { AvatarMenu } from "./AvatarMenu";

type UserProfile = {
  slug: string | null;
  displayName: string | null;
  email: string | null;
};

async function getUserProfile(): Promise<UserProfile> {
  const viewer = await getViewer();
  if (!viewer) return { slug: null, displayName: null, email: null };

  const profile = await new ProfileRepository(createSupabaseServerClient()).fetchProfileByUserId(viewer.id);
  return {
    slug: profile?.slug ?? null,
    displayName: profile?.displayName ?? null,
    email: viewer.email ?? null,
  };
}

export async function AppBar() {
  const { slug, displayName, email } = await getUserProfile();

  return (
    <header className="sticky top-0 z-40 flex min-h-18 shrink-0 items-center border-b border-folio-line bg-folio-paper/95 px-4 text-folio-ink shadow-[0_1px_0_rgba(23,58,54,0.04)] backdrop-blur-md md:fixed md:inset-y-0 md:left-0 md:min-h-0 md:w-20 md:flex-col md:items-center md:border-r md:border-b-0 md:px-4 md:py-5 md:shadow-none">
      <nav className="flex w-full items-center justify-between md:h-full md:flex-col md:items-center">
        <Logo href={slug ? `/u/${slug}` : "/"} iconOnlyOnDesktop />
        <div className="flex items-center gap-1.5 md:mt-auto md:w-full md:flex-col md:items-center">
          <AvatarMenu displayName={displayName} email={email} slug={slug} />
        </div>
      </nav>
    </header>
  );
}
