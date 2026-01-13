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

export default async function InspirationPlannerPage({ params }: PageProps) {
  const { city } = await params;
  const experience = await getInspirationExperienceProps(city);

  return <InspirationView experience={experience} />;
}
