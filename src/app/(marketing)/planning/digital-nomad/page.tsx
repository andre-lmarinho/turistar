import type { PlanningPageContent } from "../common";
import { PlanningPageTemplate } from "../common";

const content: PlanningPageContent = {
  hero: {
    eyebrow: "Digital Nomad Trips",
    title: "Balance work and exploration anywhere",
    description: "Plan remote work sprints, co-working days, and local adventures without losing focus.",
  },
  keyBenefits: {
    title: "Balance work and adventure",
    description:
      "Stay productive on the road while tracking locations, routines and expenses across multiple stops.",
    benefits: [
      {
        title: "Organize daily life",
        description:
          "Schedule coworking sessions, calls and sightseeing using drag and drop. Rearrange tasks and know your plan syncs to any device.",
      },
      {
        title: "Map your lifestyle",
        description:
          "Pin cafes, offices and attractions on a single map. Evaluate commutes and choose accommodations that fit your work rhythm while exploring.",
      },
      {
        title: "Track long term costs",
        description:
          "Monitor monthly housing, co working and leisure expenses. Adjust budget categories as your route evolves and stay financially aware throughout your journey.",
      },
    ],
  },
  faq: {
    items: [
      {
        question: "How do I balance client calls with sightseeing days?",
        answer:
          "Drag and drop work blocks, focus sessions, and outings between days. Duration and notes fields keep agendas clear while everything stays synced across devices.",
      },
      {
        question: "Can I plan multi-month stays across several cities?",
        answer:
          "Yes. Pick the full date range you need, whether it is a week or a season, and add as many days and destinations as your route requires.",
      },
      {
        question: "Where do I store Wi-Fi details, meeting links, or coworking passes?",
        answer:
          "Each activity includes rich notes, so you can save passwords, booking references, and video call URLs right next to the schedule.",
      },
      {
        question: "How do I track recurring housing or coworking fees?",
        answer:
          "Budget mode lets you log monthly rent, day passes, visas, and other costs by category, while activity-level budgets cover ad-hoc expenses on the itinerary.",
      },
      {
        question: "Will teammates see updates instantly?",
        answer:
          "Yes. Supabase Realtime keeps collaborators on the same plan in sync, so rearranged tasks or new expenses appear the moment you save them.",
      },
      {
        question: "Does the planner integrate with my calendar?",
        answer:
          "Native calendar sync is not available yet, but you can paste meeting links or calendar invite URLs into activity notes for quick access.",
      },
      {
        question: "Can I manage visa reminders or paperwork deadlines?",
        answer:
          "Create dedicated activities for document tasks, set durations or budgets for fees, and keep the latest status in notes so administrative work lives beside your travel days.",
      },
    ],
  },
};

export default function DigitalNomadTripsPage() {
  return <PlanningPageTemplate content={content} />;
}
