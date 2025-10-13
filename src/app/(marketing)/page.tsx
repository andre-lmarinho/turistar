import { HeroHome } from '@/features/website/sections/HeroHome';
import { Testimonial } from '@/features/website/sections/Testimonial';
import { KeyBenefits } from '@/features/website/sections/KeyBenefits';
import { InspirationLink } from '@/features/website/sections/InspirationLink';
import { CtaFinal } from '@/features/website/sections/CTAFinal';

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
