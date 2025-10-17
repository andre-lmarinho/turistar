import type { PlanningPageContent } from '../common';
import { PlanningPageTemplate } from '../common';

const content: PlanningPageContent = {
  hero: {
    eyebrow: 'Road Trips',
    title: 'Design scenic drives with confidence',
    description:
      'Build routes with fuel stops, lodging, and playlists so every mile feels effortless.',
  },
  keyBenefits: {
    title: 'Own your road trip',
    description:
      'Plan each leg of the journey, monitor mileage and costs, and keep everything organized in one place.',
    benefits: [
      {
        title: 'Design every leg',
        description:
          'Move stops, meals and lodgings between days with intuitive drag and drop. Any adjustments save instantly across your devices, keeping your timeline tidy.',
      },
      {
        title: 'Map your route',
        description:
          'Plot every leg on the map, visualize driving distances, and quickly see how detours affect your overall schedule before you go.',
      },
      {
        title: 'Balance your budget',
        description:
          'Keep fuel, lodging and activity expenses under control. Review totals per category and update amounts whenever plans change to stay on track.',
      },
    ],
  },
  faq: {
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
};

export default function RoadTripsPage() {
  return <PlanningPageTemplate content={content} />;
}
