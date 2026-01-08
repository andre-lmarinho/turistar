import type { Metadata } from "next";

import { getVisitedCountries } from "@/features/app/planner/server/queries/plans/getVisitedCountries";
import { WorldMapBoard } from "@/features/app/user/components/worldmap/WorldMapBoard";
import { requireUserSlugMatch } from "@/features/user/guards/requireUserSlugMatch";
import type { VisitedCountry } from "@/shared/types/worldMap";

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
  let visitedCountries: VisitedCountry[] = [];
  let visitedCountriesError: string | null = null;

  try {
    visitedCountries = await getVisitedCountries(user.id);
  } catch (getVisitedError) {
    console.error("Failed to load visited countries", getVisitedError);
    visitedCountriesError = "Unable to load visited countries. Please try again.";
  }

  const mapContent = visitedCountriesError ? (
    <div className="bg-card relative max-h-dvh w-full rounded-xl border p-4">
      <p role="alert" className="text-destructive text-sm">
        {visitedCountriesError}
      </p>
    </div>
  ) : (
    <WorldMapBoard visitedCountries={visitedCountries} />
  );

  return <>{mapContent}</>;
}
