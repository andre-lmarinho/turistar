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
        question: 'How detailed can I make each leg of the drive?',
        answer:
          'Add activities for every stop, then fill in duration, notes, and optional budgets so meal breaks, detours, and scenic outlooks stay organized.',
      },
      {
        question: 'Does the map show the full route and fuel stops?',
        answer:
          'Yes. Map mode displays every activity with coordinates, helping you spot gaps between gas stations, hotels, or attractions before you depart.',
      },
      {
        question: 'How do I plan fuel, food, or rest breaks?',
        answer:
          'Create dedicated cards for each stop, add driving notes, and drag them into the right time slot. Distances remain clear on the map while the main board shows the schedule.',
      },
      {
        question: 'How do I manage lodging and attraction costs?',
        answer:
          'Use Budget mode to categorize expenses like lodging, activities, food, or tolls. Per-stop budget fields feed the same totals so you always know where money is going.',
      },
      {
        question: 'What happens if I add a detour or reorder stops mid-trip?',
        answer:
          'Simply drag the stop to its new day or position. The plan saves instantly, and anyone viewing the itinerary sees the updated order right away.',
      },
      {
        question: 'Does the planner provide navigation or offline maps?',
        answer:
          'Turn-by-turn directions are not built in. Keep using your preferred GPS app, then store key addresses and notes in the planner for context.',
      },
      {
        question: 'Can passengers follow along on the road?',
        answer:
          'Yes. Share the public plan link so riders can open the itinerary on their phones and check what is coming up next.',
      },
    ],
  },
};

export default function RoadTripsPage() {
  return <PlanningPageTemplate content={content} />;
}
