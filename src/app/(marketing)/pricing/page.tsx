import CtaFinal from '@/features/marketing/sections/CtaFinal';
import FeatureBreakdown from '@/features/marketing/sections/FeatureBreakdown';
import HeroCentralized from '@/features/marketing/sections/HeroCentralized';
import PricingTable from '@/features/marketing/sections/PricingTable';

export default function PricingPage() {
  return (
    <main id="main-content" className="space-y-16">
      <HeroCentralized
        eyebrow="Pricing"
        title="Choose the plan that fits your travel style"
        description="Flexible options for solo planners, adventure crews, and growing teams."
        primaryAction={{ label: 'Start for free', href: '/signup' }}
        secondaryAction={{ label: 'Talk to sales', href: '/contact' }}
      />
      <PricingTable
        title="Simple, transparent pricing"
        subtitle="Every plan includes core planning tools, secure storage, and unlimited itineraries."
        plans={[
          {
            name: 'Starter',
            price: 'Free',
            description: 'Ideal for solo travelers planning occasional trips.',
            features: [
              'Unlimited itineraries',
              'Collaboration with up to 3 guests',
              'Basic packing lists',
            ],
            action: { label: 'Create free account', href: '/signup' },
          },
          {
            name: 'Collaborator',
            price: '$12/month',
            description: 'Best for friend groups and families planning multiple trips per year.',
            features: [
              'Unlimited collaborators',
              'Budget tracking and polls',
              'Shared document library',
            ],
            action: { label: 'Start trial', href: '/signup' },
            highlighted: true,
          },
          {
            name: 'Navigator',
            price: '$29/month',
            description: 'Advanced controls for teams, retreat planners, and travel pros.',
            features: ['Workflow automations', 'Approval flows and reporting', 'Priority support'],
            action: { label: 'Contact sales', href: '/contact' },
          },
        ]}
      />
      <FeatureBreakdown
        title="Compare features by plan"
        categories={[
          {
            title: 'Collaboration',
            description: 'Invite travelers, assign tasks, and share updates with ease.',
            items: [
              'Starter: Up to 3 collaborators per plan',
              'Collaborator: Unlimited collaborators',
              'Navigator: Unlimited collaborators with admin roles',
            ],
          },
          {
            title: 'Automation',
            description: 'Reduce manual follow-up with helpful reminders.',
            items: [
              'Starter: Calendar sync',
              'Collaborator: Polls and budget reminders',
              'Navigator: Custom workflows and API access',
            ],
          },
          {
            title: 'Support',
            description: 'Choose the level of help that matches your needs.',
            items: [
              'Starter: Community resources',
              'Collaborator: Email support',
              'Navigator: Priority email & chat support',
            ],
          },
        ]}
      />
      <CtaFinal
        title="Ready to start planning?"
        description="Pick a plan now and upgrade when your adventures grow."
        primaryAction={{ label: 'Create account', href: '/signup' }}
        secondaryAction={{ label: 'Talk with sales', href: '/contact' }}
      />
    </main>
  );
}
