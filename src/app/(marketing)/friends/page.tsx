import CtaFinal from '@/features/website/sections/CTAFinal';
import CtaMidPage from '@/features/website/sections/CTAMidPage';
import EasyLink from '@/features/website/sections/EasyLink';
import Features from '@/features/website/sections/Features';
import HeroTwoColumns from '@/features/website/sections/HeroTwoColumns';
import KeyBenefits from '@/features/website/sections/KeyBenefits';
import Testimonial from '@/features/website/sections/Testimonial';
import UseCases from '@/features/website/sections/UseCases';

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
        description="Empower couples and friends to organise shared itineraries by combining planning, mapping and budgeting tools."
        benefits={[
          {
            title: 'Coordinate schedules easily',
            description:
              "Drag and drop each person's ideas into a shared timeline. Watch updates save automatically so everyone's view stays aligned across all devices.",
          },
          {
            title: 'Agree on routes',
            description:
              "Use the map to visualise everyone's favourite stops. Compare distances and adjust days until the route suits the whole group.",
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
