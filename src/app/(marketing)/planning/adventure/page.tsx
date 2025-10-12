import type { PlanningPageContent } from '../common';
import { PlanningPageTemplate } from '../common';

const content: PlanningPageContent = {
  hero: {
    eyebrow: 'Adventure & Backpacking',
    title: 'Plan flexible routes for rugged trips',
    description:
      'Map multi-stop adventures, offline checklists, and gear prep so you can roam with confidence.',
    primaryAction: { label: 'Draft an adventure', href: '/signup' },
    secondaryAction: { label: 'Invite travel partners', href: '/friends' },
  },
  keyBenefits: {
    title: 'Adventure planning made simple',
    description:
      'Focus on your next thrill while our planner keeps your routes, stops and budget in order.',
    benefits: [
      {
        title: 'Arrange epic days',
        description:
          'Drag and drop gear runs, excursions and breaks across your itinerary. Move items freely and trust that every update stays saved across devices.',
      },
      {
        title: 'Navigate wild terrain',
        description:
          'Use the interactive map to plot trails, campsites and climbs. Measure distances and keep your route overview always visible while organising each day.',
      },
      {
        title: 'Track expedition costs',
        description:
          'Budget for gear, guides and transport with category totals. Tweak amounts as you spend and make sure your adventure stays financially sustainable.',
      },
    ],
  },
  ctaMidPageAction: { label: 'Plan a backpacking route', href: '/signup' },
  faq: {
    title: 'Adventure planning FAQ',
    items: [
      {
        question: 'Can I duplicate an itinerary?',
        answer:
          'Clone any plan to reuse packing lists and base schedules for your next expedition.',
      },
      {
        question: 'How do I manage split expenses?',
        answer: 'Track contributions by traveler and mark reimbursements in shared ledgers.',
      },
    ],
  },
  ctaFinal: {
    primaryAction: { label: 'Get started', href: '/signup' },
  },
};

export default function AdventureAndBackpackingPage() {
  return <PlanningPageTemplate content={content} />;
}
