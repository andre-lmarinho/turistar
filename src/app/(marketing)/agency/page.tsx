import CtaFinal from '@/features/website/sections/CTAFinal';
import HeroTwoColumns from '@/features/website/sections/HeroTwoColumns';
import KeyBenefits from '@/features/website/sections/KeyBenefits';
import Testimonial from '@/features/website/sections/Testimonial';
import UseCases from '@/features/website/sections/UseCases';

export default function AgencyPage() {
  return (
    <>
      <HeroTwoColumns
        eyebrow="For travel agencies"
        title="Serve clients better"
        description="Streamline your agency's workflow by organizing, visualizing and budgeting trips in one place."
        primaryAction={{ label: 'Start planning for clients', href: '/signup' }}
        secondaryAction={{ label: 'View pricing', href: '/pricing' }}
      />
      <KeyBenefits
        title="Serve clients better"
        description="Streamline your agency's workflow by organizing, visualizing and budgeting trips in one place."
        benefits={[
          {
            title: 'Optimize operations quickly',
            description:
              'Use drag and drop planning to update itineraries without spreadsheets. Save time and reduce mistakes with real time saving across your team.',
          },
          {
            title: 'Visualize journeys clearly',
            description:
              'Present routes, destinations and schedules on an interactive map. Help clients picture their trip and make informed decisions faster during consultations.',
          },
          {
            title: 'Manage client budgets',
            description:
              'Organize costs by service, accommodation and transport. Provide transparent totals and adjust quickly to meet financial expectations for your customers.',
          },
        ]}
      />
      <UseCases />
      <Testimonial />
      <CtaFinal primaryAction={{ label: 'Get started', href: '/signup' }} />
    </>
  );
}
