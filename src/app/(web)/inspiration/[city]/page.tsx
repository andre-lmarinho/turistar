import { PlannerClient } from '@/features/planner/components/PlannerClient';
import { getInspirationExperienceProps } from '@/features/planner/modules/inspiration/server/getInspirationExperienceProps';
import { inspirationPageMetadata } from '@/features/planner/modules/inspiration/server/pageMetadata';

export const dynamic = 'force-dynamic';

type CityParams = { city: string };

type InspirationPageProps = {
  params: Promise<CityParams>;
};

export async function generateMetadata(props: { params: Promise<CityParams> }) {
  return inspirationPageMetadata(props);
}

export default async function InspirationCityPage({ params }: InspirationPageProps) {
  const { city } = await params;
  const experienceProps = await getInspirationExperienceProps(city);

  return <PlannerClient {...experienceProps} />;
}
