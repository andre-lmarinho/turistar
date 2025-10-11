import CtaFinal from '@/shared/ui/sections/CtaFinal';
import Features from '@/shared/ui/sections/Features';
import HeroTwoColumns from '@/shared/ui/sections/HeroTwoColumns';
import KeyBenefits from '@/shared/ui/sections/KeyBenefits';
import Testimonial from '@/shared/ui/sections/Testimonial';
import UseCases from '@/shared/ui/sections/UseCases';

export default function AgencyPage() {
  return (
    <main id="main-content" className="space-y-16">
      <HeroTwoColumns
        eyebrow="For travel agencies"
        title="Serve clients better"
        description="Streamline your agency's workflow by organising, visualising and budgeting trips in one place."
        primaryAction={{ label: 'Start planning for clients', href: '/signup' }}
        secondaryAction={{ label: 'View pricing', href: '/pricing' }}
      />
      <KeyBenefits
        title="Serve clients better"
        description="Streamline your agency's workflow by organising, visualising and budgeting trips in one place."
        benefits={[
          {
            title: 'Optimise operations quickly',
            description:
              'Use drag and drop planning to update itineraries without spreadsheets. Save time and reduce mistakes with real time saving across your team.',
          },
          {
            title: 'Visualise journeys clearly',
            description:
              'Present routes, destinations and schedules on an interactive map. Help clients picture their trip and make informed decisions faster during consultations.',
          },
          {
            title: 'Manage client budgets',
            description:
              'Organise costs by service, accommodation and transport. Provide transparent totals and adjust quickly to meet financial expectations for your customers.',
          },
        ]}
      />
      <Features />
      <UseCases />
      <Testimonial />
      <CtaFinal
        primaryAction={{ label: 'Launch agency workspace', href: '/signup' }}
        secondaryAction={{ label: 'Compare pricing', href: '/pricing' }}
      />
    </main>
  );
}
