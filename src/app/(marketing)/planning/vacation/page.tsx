import type { PlanningPageContent } from "../common";
import { PlanningPageTemplate } from "../common";

const content: PlanningPageContent = {
  hero: {
    eyebrow: "Vacations & Getaways",
    title: "Curate relaxing escapes with ease",
    description:
      "Craft weekend breaks or dream holidays with collaborative itineraries, synced checklists, and reminders.",
  },
  keyBenefits: {
    title: "Make vacation planning easy",
    description:
      "Take the stress out of vacation preparation with tools that simplify planning, mapping and budgeting.",
    benefits: [
      {
        title: "Organize days easily",
        description:
          "Arrange each day of your holiday with drag and drop cards. Add or move activities and know your changes are always saved.",
      },
      {
        title: "See everywhere together",
        description:
          "Use the map view to place sightseeing, meals and excursions across days. Check distances, group stops by area and keep your itinerary visually aligned.",
      },
      {
        title: "Manage travel funds",
        description:
          "Monitor lodging, dining and activity costs by category. Adjust totals as you go and make sure your holiday stays within budget.",
      },
    ],
  },
  faq: {
    items: [
      {
        question: "How do I keep a relaxing itinerary organized without over-planning?",
        answer:
          "Drag and drop activities to arrange each day at your own pace, adding notes or durations only where you need extra detail.",
      },
      {
        question: "Can family or friends view the trip without editing it?",
        answer:
          "Share the read-only plan link created for your getaway. Guests can follow along in a browser while edit access stays with you.",
      },
      {
        question: "How do we manage shared vacation costs?",
        answer:
          "Use Budget mode to log lodging, dining, activities, and extras by category. Totals update automatically, and you can note who paid inside each line.",
      },
      {
        question: "Where do I save reservation numbers and confirmations?",
        answer:
          "Store booking codes, dining confirmations, and contact details in the notes section of each activity so everything is in one place.",
      },
      {
        question: "Does the planner send automatic reminders or emails?",
        answer:
          "Not yet. For now you can add reminder activities to the timeline and include links or phone numbers in the notes.",
      },
      {
        question: "Can I combine multiple destinations in the same getaway?",
        answer:
          "Yes. Extend your date range as needed and create activities for each city or resort. Map mode keeps every stop visible in context.",
      },
      {
        question: "How do I access the planner while traveling?",
        answer:
          "The interface is fully responsive, so the same link opens on phones, tablets, or laptops. Just make sure you have an internet connection to load the latest updates.",
      },
    ],
  },
};

export default function VacationsAndGetawaysPage() {
  return <PlanningPageTemplate content={content} />;
}
