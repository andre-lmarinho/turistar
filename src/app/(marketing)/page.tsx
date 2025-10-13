import { HeroHome } from '@/features/website/components/HeroHome';
import { Testimonial } from '@/features/website/components/Testimonial';
import { KeyBenefits } from '@/features/website/components/KeyBenefits';
import { InspirationLink } from '@/features/website/components/InspirationLink';
import { CtaFinal } from '@/features/website/components/CTAFinal';

export default function MarketingHomePage() {
  return (
    <>
      <HeroHome />
      <KeyBenefits
        title="Planner. Map. Budget."
        description="Great trips start with a plan you can see, a map that makes sense, and a budget that keeps
          choices real. Turistar brings these together so decisions are faster and planning feels
          simple."
        benefits={[
          {
            title: 'Drag. Drop. Done.',
            description:
              'View stops by day, check distances at a glance, and move between pins and cards with context intact.',
          },
          {
            title: 'See your trip on the map',
            description:
              'View stops by day, check distances at a glance, and move between pins and cards with context intact.',
          },
          {
            title: 'Built-in budget',
            description:
              'Track costs as you go. See daily and trip totals, adjust with ease, and stay on budget.',
          },
        ]}
      />
      <InspirationLink />
      <Testimonial />
      <CtaFinal primaryAction={{ label: 'Get started', href: '/signup' }} />
    </>
  );
}
