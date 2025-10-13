import { InspirationPlanner } from '@/features/planner/contracts/inspiration/InspirationPlanner';
import { getInspirationExperienceProps } from '@/features/inspiration/server/getInspirationExperienceProps';
import { inspirationPageMetadata } from '@/features/inspiration/server/pageMetadata';

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

  return <InspirationPlanner {...experienceProps} />;
}
