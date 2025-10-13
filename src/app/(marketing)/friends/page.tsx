import { CtaFinal } from '@/features/website/components/CTAFinal';
import { CtaMidPage } from '@/features/website/components/CTAMidPage';
import { EasyLink } from '@/features/website/components/EasyLink';
import { Features } from '@/features/website/components/Features';
import { HeroTwoColumns } from '@/features/website/components/HeroTwoColumns';
import { KeyBenefits } from '@/features/website/components/KeyBenefits';
import { Testimonial } from '@/features/website/components/Testimonial';
import { UseCases } from '@/features/website/components/UseCases';

export default function FriendsPage() {
  return (
    <>
      <HeroTwoColumns
        eyebrow="Plan with friends"
        title="Keep every friend aligned on the itinerary"
        description="Shared boards, polls, and budgets bring clarity to every group conversation."
        primaryAction={{ label: 'Launch group planning', href: '/signup' }}
        secondaryAction={{ label: 'See pricing', href: '/pricing' }}
      />
      <KeyBenefits
        title="Plan together with ease"
        description="Empower couples and friends to organize shared itineraries by combining planning, mapping and budgeting tools."
        benefits={[
          {
            title: 'Coordinate schedules easily',
            description:
              "Drag and drop each person's ideas into a shared timeline. Watch updates save automatically so everyone's view stays aligned across all devices.",
          },
          {
            title: 'Agree on routes',
            description:
              "Use the map to visualize everyone's favorite stops. Compare distances and adjust days until the route suits the whole group.",
          },
          {
            title: 'Share expenses fairly',
            description:
              'Track who is paying for what by category. Update totals and ensure costs are transparent so friendships stay strong throughout the trip.',
          },
        ]}
      />
      <Features />
      <EasyLink />
      <CtaMidPage />
      <UseCases />
      <Testimonial />
      <CtaFinal primaryAction={{ label: 'Get started', href: '/signup' }} />
    </>
  );
}
