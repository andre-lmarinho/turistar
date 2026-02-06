import { FriendsView } from "@/modules/marketing/friends-view";

export default function FriendsPage() {
  return (
    <FriendsView
      keyBenefits={{
        title: "Plan together with ease",
        description:
          "Empower couples and friends to organize shared itineraries by combining planning, mapping and budgeting tools.",
        benefits: [
          {
            title: "Coordinate schedules easily",
            description:
              "Drag and drop each person's ideas into a shared timeline. Watch updates save automatically so everyone's view stays aligned across all devices.",
          },
          {
            title: "Agree on routes",
            description:
              "Use the map to visualize everyone's favorite stops. Compare distances and adjust days until the route suits the whole group.",
          },
          {
            title: "Share expenses fairly",
            description:
              "Track who is paying for what by category. Update totals and ensure costs are transparent so friendships stay strong throughout the trip.",
          },
        ],
      }}
    />
  );
}
