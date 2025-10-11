import type { PlanningPageContent } from '../common';
import { PlanningPageTemplate } from '../common';

const content: PlanningPageContent = {
  hero: {
    eyebrow: 'Vacations & Getaways',
    title: 'Curate relaxing escapes with ease',
    description:
      'Craft weekend breaks or dream holidays with collaborative itineraries, synced checklists, and reminders.',
    primaryAction: { label: 'Start a vacation plan', href: '/signup' },
    secondaryAction: { label: 'See all planning types', href: '/planning' },
  },
  howItWorks: {
    title: 'Plan together without the stress',
    subtitle: 'Keep everyone aligned from inspiration to final booking.',
    steps: [
      {
        title: 'Gather your must-dos',
        description:
          'Save restaurants, sights, and experiences from any device for the group to review.',
      },
      {
        title: 'Design the perfect pace',
        description:
          'Balance downtime and adventure with timeline tools made for easy adjustments.',
      },
      {
        title: 'Stay on top of logistics',
        description:
          'Track reservations, confirmations, and travel docs so nothing slips through the cracks.',
      },
    ],
  },
  features: {
    title: 'Features tuned for leisure travel',
    items: [
      {
        title: 'Shared wishlists',
        description: 'Vote on favorite experiences and lock in the agenda everyone loves.',
      },
      {
        title: 'Calendar sync',
        description: 'Push confirmed activities into personal calendars automatically.',
      },
      {
        title: 'Packing prompts',
        description:
          'Generate personalized packing reminders based on trip length and destination.',
      },
    ],
  },
  ctaMidPage: {
    eyebrow: 'Try it now',
    title: 'Turn daydreams into confirmed plans',
    description:
      'Use our templates to map travel days, assign tasks, and finalize bookings faster.',
    action: { label: 'Create your free account', href: '/signup' },
  },
  faq: {
    title: 'Vacation planning FAQ',
    items: [
      {
        question: 'Can I import ideas from other apps?',
        answer:
          'Yes, drop links or files directly into shared boards and convert them into itinerary items.',
      },
      {
        question: 'How do I keep everyone informed?',
        answer: 'Send automatic daily summaries to each traveler with the latest schedule updates.',
      },
    ],
  },
  testimonial: {
    quote:
      'Travel Planner helped our family escape the group-chat chaos and enjoy a perfectly paced beach getaway.',
    author: 'Mariana Costa',
    role: 'Family trip organizer',
  },
  ctaFinal: {
    title: 'Bring your getaway to life',
    description: 'Start planning with collaborative tools designed for effortless vacations.',
    primaryAction: { label: 'Plan my vacation', href: '/signup' },
    secondaryAction: { label: 'Compare pricing options', href: '/pricing' },
  },
};

export default function VacationsAndGetawaysPage() {
  return <PlanningPageTemplate content={content} />;
}
