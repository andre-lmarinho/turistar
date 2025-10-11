import CtaFinal from '@/shared/ui/sections/CtaFinal';
import CtaMidPage from '@/shared/ui/sections/CtaMidPage';
import Features from '@/shared/ui/sections/Features';
import GroupDynamics from '@/shared/ui/sections/GroupDynamics';
import HeroTwoColumns from '@/shared/ui/sections/HeroTwoColumns';
import HowItWorks from '@/shared/ui/sections/HowItWorks';
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
      <HowItWorks
        title="How collaborative planning flows"
        subtitle="Skip the messaging chaos with a shared source of truth."
        steps={[
          {
            title: 'Capture ideas together',
            description:
              'Collect inspiration and let friends vote on destinations, stays, and activities.',
          },
          {
            title: 'Build the shared agenda',
            description:
              'Schedule activities, track reservations, and assign responsibilities in one view.',
          },
          {
            title: 'Finalize and celebrate',
            description:
              'Share the finished plan, monitor budgets, and keep everyone informed on the go.',
          },
        ]}
      />
      <Features
        title="Why friends love Travel Planner"
        subtitle="Bring structure to spontaneous adventures."
        items={[
          {
            title: 'Decision tools',
            description: 'Use reactions and polls so every voice has a say in the itinerary.',
          },
          {
            title: 'Budget harmony',
            description:
              'Track shared costs and balances to keep the trip affordable for everyone.',
          },
          {
            title: 'Task clarity',
            description: 'Assign bookings, packing items, and pre-trip chores with reminders.',
          },
        ]}
      />
      <GroupDynamics
        title="Support for every group dynamic"
        description="Whether you travel with college friends or family reunions, keep expectations clear."
        points={[
          {
            title: 'Organizers stay in control',
            description: 'Set budgets, deadlines, and approvals without micromanaging the details.',
          },
          {
            title: 'Travelers stay informed',
            description: 'Everyone gets the latest itinerary, payments, and tasks in real time.',
          },
          {
            title: 'Guests feel included',
            description: 'Share read-only views for extra travelers joining part of the trip.',
          },
        ]}
      />
      <CtaMidPage
        eyebrow="Shared workspace"
        title="Give your group a planning home"
        description="Consolidate the chat, spreadsheet, and docs into a single organized hub."
        action={{ label: 'Create a free group plan', href: '/signup' }}
      />
      <UseCases
        title="Popular ways friends use Travel Planner"
        items={[
          {
            title: 'Friendscations',
            description: 'Balance downtime and nightlife by planning every day together.',
          },
          {
            title: 'Reunions',
            description: 'Coordinate arrivals, shared lodging, and potluck assignments in advance.',
          },
          {
            title: 'Celebrations',
            description: 'Plan milestone birthdays or bachelor parties without missing logistics.',
          },
        ]}
      />
      <Testimonial
        quote="Planning our annual reunion is finally fun. Everyone can see the plan and pitch in."
        author="Amelia, travel organizer"
      />
      <CtaFinal
        title="Plan your next trip with friends"
        description="Bring your travel crew together around a transparent, flexible plan."
        primaryAction={{ label: 'Start a group plan', href: '/signup' }}
        secondaryAction={{ label: 'Compare pricing', href: '/pricing' }}
      />
    </main>
  );
}
