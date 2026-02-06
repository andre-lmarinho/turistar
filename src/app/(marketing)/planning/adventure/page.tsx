import type { PlanningPageContent } from "@/modules/marketing/planning-view";
import { PlanningView } from "@/modules/marketing/planning-view";

const content: PlanningPageContent = {
  hero: {
    eyebrow: "Adventure & Backpacking",
    title: "Plan flexible routes for rugged trips",
    description:
      "Map multi-stop adventures, offline checklists, and gear prep so you can roam with confidence.",
  },
  keyBenefits: {
    title: "Adventure planning made simple",
    description: "Focus on your next thrill while our planner keeps your routes, stops and budget in order.",
    benefits: [
      {
        title: "Arrange epic days",
        description:
          "Drag and drop gear runs, excursions and breaks across your itinerary. Move items freely and trust that every update stays saved across devices.",
      },
      {
        title: "Navigate wild terrain",
        description:
          "Use the interactive map to plot trails, campsites and climbs. Measure distances and keep your route overview always visible while organizing each day.",
      },
      {
        title: "Track expedition costs",
        description:
          "Budget for gear, guides and transport with category totals. Tweak amounts as you spend and make sure your adventure stays financially sustainable.",
      },
    ],
  },
  faq: {
    items: [
      {
        question: "How quickly can I reshuffle activities when the forecast changes?",
        answer:
          "Drag and drop hikes, transfers, or rest days between the schedule. Every move saves immediately through Supabase so co-leads always open the latest plan.",
      },
      {
        question: "Will my co-leads see edits as they happen?",
        answer:
          "Yes. The planner streams updates over Supabase Realtime channels, so anyone on the same plan ID watches changes appear without refreshing.",
      },
      {
        question: "How do I pin remote campsites or trailheads that lack clear addresses?",
        answer:
          "Paste GPS coordinates or place names into the activity address field. We geocode with OpenStreetMap, and if nothing matches you still keep the directions in notes while the itinerary stays organized.",
      },
      {
        question: "What details can I track for gear checks and safety briefings?",
        answer:
          "Activities support notes, estimated duration, and optional budget amounts, letting you log pack inspections, nutrition plans, or emergency drills alongside the route.",
      },
      {
        question: "Can I monitor permits, guides, and resupplies in one budget view?",
        answer:
          "Switch to Budget mode to categorize spending (transport, lodging, documents, etc.) and add line items. Activity-level budgets roll into the same totals so nothing gets missed.",
      },
      {
        question: "Does the planner work when we lose signal in the backcountry?",
        answer:
          "You need an internet connection to load or sync edits. Review or print the itinerary before heading out, then add updates once you are back online.",
      },
      {
        question: "Can I review the full route on a map before departure?",
        answer:
          "Yes. Map mode plots every activity with coordinates on an interactive map so you can double-check trailheads, camps, and approach distances.",
      },
    ],
  },
};

export default function AdventureAndBackpackingPage() {
  return <PlanningView content={content} />;
}
