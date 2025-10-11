import HeroCentralized from '@/features/marketing/sections/HeroCentralized';
import PlanFormSection from '@/features/marketing/sections/PlanForm';

export default function SignupPage() {
  return (
    <main id="main-content" className="space-y-16">
      <HeroCentralized
        eyebrow="Get started"
        title="Create your Travel Planner account"
        description="Open a workspace where every itinerary, traveler, and detail lives together."
        primaryAction={{ label: 'Start planning', href: '#plan-form' }}
        secondaryAction={{ label: 'View pricing', href: '/pricing' }}
      />
      <PlanFormSection
        id="plan-form"
        title="Plan your first trip"
        description="Launch the planner to pick dates, choose a destination, and invite your travel crew."
      />
    </main>
  );
}
