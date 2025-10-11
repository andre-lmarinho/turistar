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
  howItWorks: {
    title: 'Own your itinerary from trailhead to hostel',
    subtitle: 'Organize routes, transport, and contingencies in one place.',
    steps: [
      {
        title: 'Plot adaptable stages',
        description:
          'Break down travel legs with buffer days and alternate options to stay nimble.',
      },
      {
        title: 'Sync gear checklists',
        description: 'Assign equipment, verify supplies, and track what is packed or borrowed.',
      },
      {
        title: 'Prepare for offline mode',
        description: 'Download key itineraries and contacts for use when connectivity fades.',
      },
    ],
  },
  features: {
    title: 'Tools backpackers rely on',
    items: [
      {
        title: 'Route versions',
        description: 'Compare alternate trails, travel times, and budgets side by side.',
      },
      {
        title: 'Task assignments',
        description: 'Coordinate who books transport, secures permits, and handles food planning.',
      },
      {
        title: 'Offline exports',
        description: 'Save PDFs and offline maps to access your plan from anywhere.',
      },
    ],
  },
  ctaMidPage: {
    eyebrow: 'Adventure-ready',
    title: 'Keep every leg of the journey organized',
    description:
      'Log campsites, overnight buses, and must-see stops with adaptable scheduling tools.',
    action: { label: 'Plan a backpacking route', href: '/signup' },
  },
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
  testimonial: {
    quote:
      'Our trek through Patagonia stayed on track thanks to synced gear lists and offline itineraries.',
    author: 'Diego Martins',
    role: 'Backpacking guide',
  },
  ctaFinal: {
    title: 'Chart your next adventure',
    description:
      'Use Travel Planner to prepare routes, pack smarter, and stay coordinated anywhere.',
    primaryAction: { label: 'Start a free plan', href: '/signup' },
    secondaryAction: { label: 'Review feature set', href: '/pricing' },
  },
};

export default function AdventureAndBackpackingPage() {
  return <PlanningPageTemplate content={content} />;
}
