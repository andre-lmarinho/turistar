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
        <Features
          title="Trip types we support"
          subtitle="Each template comes with curated workflows and guidance."
          items={[
            {
              title: 'Vacations & Getaways',
              description: 'Relaxing escapes with collaborative agendas and packing reminders.',
            },
            {
              title: 'Adventure & Backpacking',
              description: 'Flexible itineraries, offline tools, and gear coordination.',
            },
            {
              title: 'Road Trips',
              description: 'Routes, fuel planning, and driver handoffs made simple.',
            },
            {
              title: 'Event-based Trips',
              description: 'Centralized logistics for conferences, weddings, and celebrations.',
            },
            {
              title: 'Group Getaways',
              description: 'Shared budgets, votes, and decisions for every travel crew.',
            },
            {
              title: 'Digital Nomad Trips',
              description: 'Balance productivity with exploration across time zones.',
            },
          ]}
        />
      </section>
      <CtaFinal
        title="Ready to explore a template?"
        description="Jump into any planning experience and customize it for your group."
        primaryAction={{ label: 'Create an account', href: '/signup' }}
        secondaryAction={{ label: 'View pricing', href: '/pricing' }}
      />
    </main>
  );
}
