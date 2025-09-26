// src/features/inspiration/index.tsx

import { InspirationPlanner } from '@/features/planner/contracts/inspiration/InspirationPlanner';

import { getInspirationExperienceProps } from './server/getInspirationExperienceProps';

type CityParams = { city: string };

type InspirationPageProps = {
  params: Promise<CityParams>;
};

export default async function InspirationPage({ params }: InspirationPageProps) {
  const { city } = await params;
  const experienceProps = await getInspirationExperienceProps(city);

  return <InspirationPlanner {...experienceProps} />;
}

export { inspirationPageMetadata } from './server/pageMetadata';
export type { InspirationExperienceProps } from './server/getInspirationExperienceProps';
