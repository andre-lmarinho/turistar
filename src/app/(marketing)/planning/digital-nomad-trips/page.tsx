import type { PlanningPageContent } from '../common';
import { PlanningPageTemplate } from '../common';

const content: PlanningPageContent = {
  hero: {
    eyebrow: 'Digital Nomad Trips',
    title: 'Balance work and exploration anywhere',
    description:
      'Plan remote work sprints, co-working days, and local adventures without losing focus.',
    primaryAction: { label: 'Build a nomad plan', href: '/signup' },
    secondaryAction: { label: 'Share with your crew', href: '/friends' },
  },
  howItWorks: {
    title: 'Productive days, memorable nights',
    subtitle: 'Coordinate reliable Wi-Fi, time zones, and free time in one schedule.',
    steps: [
      {
        title: 'Outline work blocks',
        description: 'Map dedicated focus hours, meetings, and quiet zones for every teammate.',
      },
      {
        title: 'Reserve work-friendly spots',
        description:
          'Track co-working passes, cafés, and stay locations with connectivity details.',
      },
      {
        title: 'Slot in local experiences',
        description: 'Plan shared meals and excursions so you can explore together after work.',
      },
    ],
  },
  features: {
    title: 'Features nomads depend on',
    items: [
      {
        title: 'Time zone intelligence',
        description: 'Visualize overlapping availability across continents instantly.',
      },
      {
        title: 'Workspace database',
        description: 'Log Wi-Fi speeds, amenities, and access info for your favorite spots.',
      },
      {
        title: 'Wellness reminders',
        description: 'Add prompts for movement, breaks, and hydration during intense work periods.',
      },
    ],
  },
  ctaMidPage: {
    eyebrow: 'Work + travel',
    title: 'Keep the team aligned across time zones',
    description: 'Share a single plan that respects workloads while celebrating new cities.',
    action: { label: 'Start a nomad workspace', href: '/signup' },
  },
  faq: {
    title: 'Digital nomad FAQ',
    items: [
      {
        question: 'Can I integrate meeting tools?',
        answer: 'Link calendar invites and video rooms to itinerary blocks for quick access.',
      },
      {
        question: 'How do we manage visas and docs?',
        answer: 'Store required paperwork, deadlines, and status updates in shared trackers.',
      },
    ],
  },
  testimonial: {
    quote: 'Our remote squad stayed productive across Lisbon and Berlin with shared work blocks.',
    author: 'Thiago Moreira',
    role: 'Remote team lead',
  },
  ctaFinal: {
    title: 'Design your next work-from-anywhere plan',
    description: 'Blend productivity and discovery with organized itineraries for remote teams.',
    primaryAction: { label: 'Start planning today', href: '/signup' },
    secondaryAction: { label: 'Evaluate pricing', href: '/pricing' },
  },
};

export default function DigitalNomadTripsPage() {
  return <PlanningPageTemplate content={content} />;
}
