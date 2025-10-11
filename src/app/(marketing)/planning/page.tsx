import CtaFinal from '@/shared/ui/sections/CtaFinal';
import Features from '@/shared/ui/sections/Features';
import HeroCentralized from '@/shared/ui/sections/HeroCentralized';

export default function PlanningOverviewPage() {
  return (
    <main id="main-content" className="space-y-16">
      <HeroCentralized
        eyebrow="Planning Library"
        title="Choose the trip style that fits your journey"
        description="Explore templates tailored for vacations, road trips, events, and more—all powered by Travel Planner."
        primaryAction={{ label: 'Start planning', href: '/signup' }}
        secondaryAction={{ label: 'Browse trip types', href: '#trip-types' }}
      />
      <section id="trip-types">
        <Features />
      </section>
      <CtaFinal
        variant="planning"
        primaryAction={{ label: 'Create an account', href: '/signup' }}
        secondaryAction={{ label: 'View pricing', href: '/pricing' }}
      />
    </main>
  );
}
