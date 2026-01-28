import type { PlanningPageContent } from "@/features/website/layout/PlanningShell";
import { PlanningShell } from "@/features/website/layout/PlanningShell";

const content: PlanningPageContent = {
  hero: {
    eyebrow: "Event-based Trips",
    title: "Coordinate travel around milestone moments",
    description: "From weddings to conferences, keep attendees aligned on logistics, tickets, and schedules.",
  },
  keyBenefits: {
    title: "Keep your event organized",
    description: "Manage itineraries tied to fixed dates and venues while keeping routes and costs clear.",
    benefits: [
      {
        title: "Schedule with ease",
        description:
          "Drag and drop sessions, parties and appointments into days. Rearrange quickly and know the plan is saved and synced for everyone involved.",
      },
      {
        title: "Visual venue map",
        description:
          "Mark ceremony halls, stages and hotels on the map. See distances between venues and ensure logistics make sense for each day.",
      },
      {
        title: "Control event costs",
        description:
          "Categorize expenses like venue hire, food and travel. Compare actual spending to your allocated budget and adjust before overspending throughout the planning.",
      },
    ],
  },
  faq: {
    items: [
      {
        question: "How do I keep ceremonies, sessions, and breakouts aligned?",
        answer:
          "Use drag and drop to position activities within each day, then add durations and notes so call times, speaker cues, and staging details stay visible for the team.",
      },
      {
        question: "Can I visualize venues and transfers on one map?",
        answer:
          "Yes. Map mode plots every activity with saved coordinates, helping you verify travel time between hotels, venues, and off-site events at a glance.",
      },
      {
        question: "How do I share the agenda with vendors or attendees without giving edit access?",
        answer:
          "Share the public plan link generated for your event. Guests can view the schedule in a browser while edit tokens stay with the planning team.",
      },
      {
        question: "Can multiple planners edit the agenda simultaneously?",
        answer:
          "Absolutely. Supabase Realtime keeps collaborators in sync so updates from coordinators, AV, or catering appear instantly for everyone logged into the plan.",
      },
      {
        question: "How do we track vendor deposits and ticket costs?",
        answer:
          "Open the Budget mode to categorize spending such as venue fees, catering, documents, and travel, then enter each expense. Activity-level budgets feed those totals too.",
      },
      {
        question: "Where can I keep arrival manifests or run sheets?",
        answer:
          "Create dedicated activities for arrivals, setup windows, or teardown, and store the latest run sheets or contact details in the notes field.",
      },
      {
        question: "Can I upload contracts or floor plans?",
        answer:
          "File uploads are not available yet. Add cloud links inside notes so teammates can open contracts, seating charts, or presentations from the itinerary.",
      },
    ],
  },
};

export default function EventBasedTripsPage() {
  return <PlanningShell content={content} />;
}
