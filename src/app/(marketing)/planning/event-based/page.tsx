import type { PlanningPageContent } from '../common';
import { PlanningPageTemplate } from '../common';

const content: PlanningPageContent = {
  hero: {
    eyebrow: 'Event-based Trips',
    title: 'Coordinate travel around milestone moments',
    description:
      'From weddings to conferences, keep attendees aligned on logistics, tickets, and schedules.',
  },
  keyBenefits: {
    title: 'Keep your event organized',
    description:
      'Manage itineraries tied to fixed dates and venues while keeping routes and costs clear.',
    benefits: [
      {
        title: 'Schedule with ease',
        description:
          'Drag and drop sessions, parties and appointments into days. Rearrange quickly and know the plan is saved and synced for everyone involved.',
      },
      {
        title: 'Visual venue map',
        description:
          'Mark ceremony halls, stages and hotels on the map. See distances between venues and ensure logistics make sense for each day.',
      },
      {
        title: 'Control event costs',
        description:
          'Categorize expenses like venue hire, food and travel. Compare actual spending to your allocated budget and adjust before overspending throughout the planning.',
      },
    ],
  },
  faq: {
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
};

export default function EventBasedTripsPage() {
  return <PlanningPageTemplate content={content} />;
}
