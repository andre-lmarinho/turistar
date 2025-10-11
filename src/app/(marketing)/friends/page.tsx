import CtaFinal from '@/shared/ui/sections/CtaFinal';
import CtaMidPage from '@/shared/ui/sections/CtaMidPage';
import EasyLink from '@/shared/ui/sections/EasyLink';
import Features from '@/shared/ui/sections/Features';
import HeroTwoColumns from '@/shared/ui/sections/HeroTwoColumns';
import KeyBenefits from '@/shared/ui/sections/KeyBenefits';
import Testimonial from '@/shared/ui/sections/Testimonial';
import UseCases from '@/shared/ui/sections/UseCases';

export default function FriendsPage() {
  return (
    <main id="main-content" className="space-y-16">
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
      <CtaFinal
        primaryAction={{ label: 'Start a group plan', href: '/signup' }}
        secondaryAction={{ label: 'Compare pricing', href: '/pricing' }}
      />
    </main>
  );
}
