import type { PlanningPageContent } from "@/features/website/layout/PlanningShell";
import { PlanningShell } from "@/features/website/layout/PlanningShell";

const content: PlanningPageContent = {
  hero: {
    eyebrow: "Group Getaways",
    title: "Coordinate shared escapes with clarity",
    description: "Align friends or family on budgets, schedules, and responsibilities without endless chats.",
  },
  keyBenefits: {
    title: "Improve group travel",
    description:
      "Create, update and share itineraries for large and small groups while keeping schedules and costs clear.",
    benefits: [
      {
        title: "Simplify group coordination",
        description:
          "Use drag and drop to arrange days, activities and meals for multiple travelers. Edits save instantly so everyone stays aligned.",
      },
      {
        title: "Visualize group routes",
        description:
          "Present routes and meeting points on an interactive map. See distances between stops and make sure the itinerary works for all participants.",
      },
      {
        title: "Balance shared budgets",
        description:
          "Monitor group expenses across categories like transport, lodging and activities. Update totals collaboratively and keep spending transparent to maintain trust.",
      },
    ],
  },
  faq: {
    items: [
      {
        question: "How do we keep everyone aligned without endless chat threads?",
        answer:
          "Share the plan link generated at signup. Any edits you make save instantly, so friends can refresh the itinerary instead of asking for the latest version.",
      },
      {
        question: "Can multiple friends edit the plan at the same time?",
        answer:
          "Yes. Supabase Realtime lets collaborators move cards or update notes simultaneously while the board resolves changes in place.",
      },
      {
        question: "How do we handle shared expenses during the trip?",
        answer:
          "Use Budget mode to log costs by category (transport, lodging, food, activities) and note who covered each line. Per-person balance calculations are not automated yet, but the totals stay transparent.",
      },
      {
        question: "Where do we note who is responsible for bookings or errands?",
        answer:
          "Add a card for each task and capture the owner, confirmation numbers, and checklists inside the notes so responsibilities stay visible to the group.",
      },
      {
        question: "What if travelers arrive or leave on different days?",
        answer:
          "Extend the date range to cover everyone, then create activities (e.g., airport pickups, late check-ins) on the relevant days. The map view shows where overlapping plans meet.",
      },
      {
        question: "Can the planner track individual budgets automatically?",
        answer:
          "Not yet. Today you can keep separate categories or notes per traveler, and we will surface per-person summaries in a future update.",
      },
      {
        question: "Will the itinerary work on everyone's phones?",
        answer:
          "Yes. The planner UI is responsive, so the same shared link opens on mobile browsers, tablets, or laptops without installing anything.",
      },
    ],
  },
};

export default function GroupGetawaysPage() {
  return <PlanningShell content={content} />;
}
