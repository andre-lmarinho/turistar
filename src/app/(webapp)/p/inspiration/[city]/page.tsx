import type { Metadata } from "next";

import { generateInspirationMetadata } from "@/features/inspirations/lib/generateInspirationMetadata";
import { getInspirationExperienceProps } from "@/features/inspirations/lib/getInspirationExperienceProps";
import { InspirationView } from "@/modules/planner/inspiration-view";

type PageProps = {
  params: Promise<{ city: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city } = await params;
  return generateInspirationMetadata(city);
}

/**
 * Renders the InspirationView for the specified city using computed experience data.
 *
 * @param params - A Promise that resolves to an object with a `city` route parameter (e.g., `{ city: string }`)
 * @returns A React element representing the inspiration planner page
 */
export default async function InspirationPlannerPage({ params }: PageProps) {
  const { city } = await params;
  const experience = await getInspirationExperienceProps(city);

  return <InspirationView experience={experience} />;
}