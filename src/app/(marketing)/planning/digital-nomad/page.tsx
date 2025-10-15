import type { PlanningPageContent } from '../common';
import { PlanningPageTemplate } from '../common';

const content: PlanningPageContent = {
  hero: {
    eyebrow: 'Digital Nomad Trips',
    title: 'Balance work and exploration anywhere',
    description:
      'Plan remote work sprints, co-working days, and local adventures without losing focus.',
  },
  keyBenefits: {
    title: 'Balance work and adventure',
    description:
      'Stay productive on the road while tracking locations, routines and expenses across multiple stops.',
    benefits: [
      {
        title: 'Organize daily life',
        description:
          'Schedule coworking sessions, calls and sightseeing using drag and drop. Rearrange tasks and know your plan syncs to any device.',
      },
      {
        title: 'Map your lifestyle',
        description:
          'Pin cafes, offices and attractions on a single map. Evaluate commutes and choose accommodations that fit your work rhythm while exploring.',
      },
      {
        title: 'Track long term costs',
        description:
          'Monitor monthly housing, co working and leisure expenses. Adjust budget categories as your route evolves and stay financially aware throughout your journey.',
      },
    ],
  },
  faq: {
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
};

export default function DigitalNomadTripsPage() {
  return <PlanningPageTemplate content={content} />;
}
