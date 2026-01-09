import type { Metadata } from "next";

import { requireUserSlugMatch } from "@/features/user/lib/requireUserSlugMatch";
import { getVisitedCountries } from "@/features/visitedCountries/lib/getVisitedCountries";
import { WorldMapView } from "@/modules/user/worldmap-view";

export const metadata: Metadata = {
  title: "Worldmap | Turistar App",
};

interface DashboardWorldmapPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function DashboardWorldmapPage({ params }: DashboardWorldmapPageProps) {
  const { slug } = await params;
  const { user } = await requireUserSlugMatch(slug);
  const visitedCountries = await getVisitedCountries(user.id);

  return <WorldMapView visitedCountries={visitedCountries} />;
}
