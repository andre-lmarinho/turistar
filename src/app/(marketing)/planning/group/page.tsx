import type { PlanningPageContent } from '../common';
import { PlanningPageTemplate } from '../common';

const content: PlanningPageContent = {
  hero: {
    eyebrow: 'Group Getaways',
    title: 'Coordinate shared escapes with clarity',
    description:
      'Align friends or family on budgets, schedules, and responsibilities without endless chats.',
    primaryAction: { label: 'Plan a group trip', href: '/signup' },
    secondaryAction: { label: 'Discover collaboration tools', href: '/friends' },
  },
  howItWorks: {
    title: 'Everyone knows the plan',
    subtitle: 'Give the group a shared space to vote, decide, and stay on budget.',
    steps: [
      {
        title: 'Set shared expectations',
        description:
          'Outline budget ranges, travel styles, and destination ideas for quick alignment.',
      },
      {
        title: 'Vote on the itinerary',
        description:
          'Use reactions and polls to finalize dates, activities, and meal plans together.',
      },
      {
        title: 'Track commitments',
        description: 'Assign payments and tasks so every traveler knows what to do next.',
      },
    ],
  },
  features: {
    title: 'Purpose-built for group coordination',
    items: [
      {
        title: 'Shared budgets',
        description: 'Set contribution goals and monitor who has paid or still owes.',
      },
      {
        title: 'Decision tracking',
        description: 'Log choices and reasoning so everyone understands the final plan.',
      },
      {
        title: 'Availability survey',
        description: 'Collect availability automatically to choose dates that work for all.',
      },
    ],
  },
  ctaMidPage: {
    eyebrow: 'Collaborative planning',
    title: 'Give the group one source of truth',
    description: 'Reduce back-and-forth with a shared workspace that updates instantly.',
    action: { label: 'Launch a group workspace', href: '/signup' },
  },
  faq: {
    title: 'Group planning FAQ',
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
  testimonial: {
    quote: 'The shared budget view kept our reunion transparent and stress-free for every friend.',
    author: 'Camila Ribeiro',
    role: 'Group trip organizer',
  },
  ctaFinal: {
    title: 'Plan your group getaway',
    description: 'Give every traveler clarity on budgets, tasks, and the itinerary in minutes.',
    primaryAction: { label: 'Start organizing', href: '/signup' },
    secondaryAction: { label: 'See collaboration pricing', href: '/pricing' },
  },
};

export default function GroupGetawaysPage() {
  return <PlanningPageTemplate content={content} />;
}
