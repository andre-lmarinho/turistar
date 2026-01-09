import type { Metadata } from "next";

import { requireUserSlugMatch } from "@/features/user/lib/requireUserSlugMatch";
import { InspirationsView } from "@/modules/user/inspirations-view";

export const metadata: Metadata = {
  title: "Inspirations | Turistar App",
};

interface UserInspirationsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function UserInspirationsPage({ params }: UserInspirationsPageProps) {
  const { slug } = await params;
  await requireUserSlugMatch(slug);

  return <InspirationsView />;
}
