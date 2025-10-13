import { CtaFinal } from '@/features/website/sections/CTAFinal';
import { CtaMidPage } from '@/features/website/sections/CTAMidPage';
import { PricingFeature } from '@/features/website/sections/PricingFeature';
import { PricingTable as HeroPricing } from '@/features/website/sections/HeroPricing';

export default function PricingPage() {
  return (
    <>
      <HeroPricing
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
      <CtaMidPage />
      <PricingFeature
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
      <CtaFinal primaryAction={{ label: 'Get started', href: '/signup' }} />
    </>
  );
}
