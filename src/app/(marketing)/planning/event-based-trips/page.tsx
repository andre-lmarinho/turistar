import type { PlanningPageContent } from '../common';
import { PlanningPageTemplate } from '../common';

const content: PlanningPageContent = {
  hero: {
    eyebrow: 'Event-based Trips',
    title: 'Coordinate travel around milestone moments',
    description:
      'From weddings to conferences, keep attendees aligned on logistics, tickets, and schedules.',
    primaryAction: { label: 'Organize an event trip', href: '/signup' },
    secondaryAction: { label: 'Share with attendees', href: '/friends' },
  },
  howItWorks: {
    title: 'Stay on top of every schedule change',
    subtitle: 'Manage arrivals, sessions, and group outings in one hub.',
    steps: [
      {
        title: 'Centralize key details',
        description: 'Collect agendas, venue maps, dress codes, and contact info for every guest.',
      },
      {
        title: 'Coordinate arrivals',
        description:
          'Track flights, hotel confirmations, and transportation assignments by traveler.',
      },
      {
        title: 'Keep communication flowing',
        description: 'Share updates instantly and notify attendees when sessions shift.',
      },
    ],
  },
  features: {
    title: 'Tools for seamless event travel',
    items: [
      {
        title: 'RSVP tracking',
        description: 'Monitor who is attending which activities and follow up with reminders.',
      },
      {
        title: 'Document library',
        description: 'Store tickets, presentation decks, and run-of-show notes in one place.',
      },
      {
        title: 'Task automation',
        description: 'Automate nudges for payment deadlines, check-ins, or packing requirements.',
      },
    ],
  },
  ctaMidPage: {
    eyebrow: 'Event-ready',
    title: 'Make every attendee feel supported',
    description: 'Provide a single source of truth that updates across time zones and schedules.',
    action: { label: 'Plan an event trip', href: '/signup' },
  },
  faq: {
    title: 'Event travel FAQ',
    items: [
      {
        question: 'Can I segment attendees?',
        answer: 'Create groups for speakers, VIPs, or teams and tailor communications to each.',
      },
      {
        question: 'How do I manage last-minute changes?',
        answer: 'Update the itinerary once and broadcast notifications to everyone automatically.',
      },
    ],
  },
  testimonial: {
    quote:
      'Coordinating our conference travel was painless—everyone knew where to be and had docs handy.',
    author: 'Renata Azevedo',
    role: 'Event producer',
  },
  ctaFinal: {
    title: 'Deliver a standout event experience',
    description:
      'Plan attendee travel, logistics, and downtime activities in one collaborative space.',
    primaryAction: { label: 'Start coordinating', href: '/signup' },
    secondaryAction: { label: 'See pricing plans', href: '/pricing' },
  },
};

export default function EventBasedTripsPage() {
  return <PlanningPageTemplate content={content} />;
}
