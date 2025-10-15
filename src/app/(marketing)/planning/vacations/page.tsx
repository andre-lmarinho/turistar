import type { PlanningPageContent } from '../common';
import { PlanningPageTemplate } from '../common';

const content: PlanningPageContent = {
  hero: {
    eyebrow: 'Vacations & Getaways',
    title: 'Curate relaxing escapes with ease',
    description:
      'Craft weekend breaks or dream holidays with collaborative itineraries, synced checklists, and reminders.',
  },
  keyBenefits: {
    title: 'Make vacation planning easy',
    description:
      'Take the stress out of vacation preparation with tools that simplify planning, mapping and budgeting.',
    benefits: [
      {
        title: 'Organize days easily',
        description:
          'Arrange each day of your holiday with drag and drop cards. Add or move activities and know your changes are always saved.',
      },
      {
        title: 'See everywhere together',
        description:
          'Use the map view to place sightseeing, meals and excursions across days. Check distances, group stops by area and keep your itinerary visually aligned.',
      },
      {
        title: 'Manage travel funds',
        description:
          'Monitor lodging, dining and activity costs by category. Adjust totals as you go and make sure your holiday stays within budget.',
      },
    ],
  },
  faq: {
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
};

export default function VacationsAndGetawaysPage() {
  return <PlanningPageTemplate content={content} />;
}
