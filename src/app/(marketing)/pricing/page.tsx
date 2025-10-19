import { CtaFinal } from '@/features/website/sections/CTAFinal';
import { CtaMidPage } from '@/features/website/sections/CTAMidPage';
import { PricingFeature } from '@/features/website/sections/PricingFeatures';
import { HeroPricing } from '@/features/website/sections/PricingHero';
import { TrustedBy } from '@/features/website/sections/TrustedBy';

export default function PricingPage() {
  return (
    <>
      <HeroPricing />
      <TrustedBy />
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
      <CtaFinal />
    </>
  );
}
