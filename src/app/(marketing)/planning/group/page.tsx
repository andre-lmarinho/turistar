import type { PlanningPageContent } from '../common';
import { PlanningPageTemplate } from '../common';

const content: PlanningPageContent = {
  hero: {
    eyebrow: 'Group Getaways',
    title: 'Coordinate shared escapes with clarity',
    description:
      'Align friends or family on budgets, schedules, and responsibilities without endless chats.',
  },
  keyBenefits: {
    title: 'Improve group travel',
    description:
      'Create, update and share itineraries for large and small groups while keeping schedules and costs clear.',
    benefits: [
      {
        title: 'Simplify group coordination',
        description:
          'Use drag and drop to arrange days, activities and meals for multiple travelers. Edits save instantly so everyone stays aligned.',
      },
      {
        title: 'Visualize group routes',
        description:
          'Present routes and meeting points on an interactive map. See distances between stops and make sure the itinerary works for all participants.',
      },
      {
        title: 'Balance shared budgets',
        description:
          'Monitor group expenses across categories like transport, lodging and activities. Update totals collaboratively and keep spending transparent to maintain trust.',
      },
    ],
  },
  faq: {
    items: [
      {
        question: 'Can travelers pay different amounts?',
        answer: 'Set suggested contributions per traveler and track balances individually.',
      },
      {
        question: 'How do we divide responsibilities?',
        answer: 'Assign bookings, groceries, and other tasks with due dates and reminders.',
      },
    ],
  },
};

export default function GroupGetawaysPage() {
  return <PlanningPageTemplate content={content} />;
}
