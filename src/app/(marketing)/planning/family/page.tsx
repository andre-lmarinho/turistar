import type { PlanningPageContent } from "@/modules/marketing/planning-view";
import { PlanningView } from "@/modules/marketing/planning-view";

const content: PlanningPageContent = {
  hero: {
    eyebrow: "Family Trips",
    title: "Plan family travel without itinerary chaos",
    description:
      "Keep kids, parents, and logistics in sync with one shared plan for dates, routes, and budgets.",
  },
  keyBenefits: {
    title: "Family planning with less stress",
    description:
      "Build schedules that work for different ages while keeping transport, costs, and priorities visible.",
    benefits: [
      {
        title: "Coordinate everyone",
        description:
          "Organize activities around nap times, check-ins, and must-see stops. Drag and drop updates as plans change.",
      },
      {
        title: "Map practical routes",
        description:
          "Plot attractions, meals, and lodging on one map so transfers and distances stay realistic for your group.",
      },
      {
        title: "Track family spending",
        description:
          "Monitor transport, food, tickets, and extras in one budget flow so decisions stay clear throughout the trip.",
      },
    ],
  },
  faq: {
    items: [
      {
        question: "How can we plan around different routines in the same trip?",
        answer:
          "Create activities for key anchors like breakfast, transfers, naps, or rest windows, then move items with drag and drop as the day evolves.",
      },
      {
        question: "Can relatives view the itinerary without editing it?",
        answer:
          "Yes. Share the public plan link so family members can follow the latest timeline from any browser.",
      },
      {
        question: "How do we keep booking references and notes in one place?",
        answer:
          "Use activity notes to store reservation numbers, addresses, contacts, and reminders next to each stop.",
      },
      {
        question: "Can we manage costs across different categories?",
        answer:
          "Use Budget mode to log spending by category like lodging, food, activities, and transport while totals stay up to date.",
      },
      {
        question: "Will updates sync when more than one person edits?",
        answer:
          "Yes. Supabase Realtime syncs updates so changes appear for collaborators without manual refresh.",
      },
      {
        question: "Does the planner work on mobile while we are out?",
        answer: "Yes. The interface is responsive and works on phones, tablets, and desktop browsers.",
      },
      {
        question: "Can we save emergency information in the plan?",
        answer:
          "You can keep emergency contacts, meeting points, and practical notes inside activity cards for quick access.",
      },
    ],
  },
};

export default function FamilyTripsPage() {
  return <PlanningView content={content} />;
}
