import type { PlanningPageContent } from '../common';
import { PlanningPageTemplate } from '../common';

const content: PlanningPageContent = {
  hero: {
    eyebrow: 'Road Trips',
    title: 'Design scenic drives with confidence',
    description:
      'Build routes with fuel stops, lodging, and playlists so every mile feels effortless.',
    primaryAction: { label: 'Map a road trip', href: '/signup' },
    secondaryAction: { label: 'Share with co-drivers', href: '/friends' },
  },
  howItWorks: {
    title: 'Every stop accounted for',
    subtitle: 'Plan daily distances, rest breaks, and sightseeing without spreadsheets.',
    steps: [
      {
        title: 'Draft the master route',
        description: 'Plot segments, estimated drive times, and scenic detours across the map.',
      },
      {
        title: 'Log essential stops',
        description: 'Track fuel, meals, and overnight stays with reminders for reservations.',
      },
      {
        title: 'Keep the crew updated',
        description: 'Share live itineraries and adjust plans together as the journey unfolds.',
      },
    ],
  },
  features: {
    title: 'Features for road trip strategists',
    items: [
      {
        title: 'Segment budgeting',
        description: 'Estimate tolls, fuel, and lodging costs for each stretch of the drive.',
      },
      {
        title: 'Vehicle checklists',
        description: 'Stay on top of maintenance tasks before departure and on the road.',
      },
      {
        title: 'Shared navigation links',
        description: 'Launch navigation apps from itinerary cards with pre-filled addresses.',
      },
    ],
  },
  ctaMidPage: {
    eyebrow: 'Road-tested',
    title: 'Create a smooth drive from start to finish',
    description: 'Coordinate drivers, playlists, and pit stops in a single view.',
    action: { label: 'Start planning your drive', href: '/signup' },
  },
  faq: {
    title: 'Road trip FAQ',
    items: [
      {
        question: 'Can I reuse my packing lists?',
        answer: 'Yes, copy lists between plans and customize them for each adventure.',
      },
      {
        question: 'How detailed can I get with stops?',
        answer: 'Add notes, attachments, and custom reminders for every waypoint.',
      },
    ],
  },
  testimonial: {
    quote:
      'We crossed three states without a hitch thanks to coordinated stops and shared navigation links.',
    author: 'Laura Campos',
    role: 'Road trip planner',
  },
  ctaFinal: {
    title: 'Hit the road with a plan',
    description:
      'Use Travel Planner to align routes, responsibilities, and budgets before you drive.',
    primaryAction: { label: 'Plan my drive', href: '/signup' },
    secondaryAction: { label: 'View pricing tiers', href: '/pricing' },
  },
};

export default function RoadTripsPage() {
  return <PlanningPageTemplate content={content} />;
}
