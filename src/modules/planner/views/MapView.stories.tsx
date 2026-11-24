import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import type { DayPlan } from "@/features/activity/types";

import { MapView } from "./MapView";

const days: DayPlan[] = [
  {
    id: "2024-07-05",
    label: "Fri, 05 Jul",
    activities: [
      {
        id: "museum",
        title: "Louvre Museum",
        color: "bg-[var(--color-1)]",
        latitude: 48.8606,
        longitude: 2.3376,
      },
      {
        id: "lunch",
        title: "Lunch near the Seine",
        color: "bg-[var(--color-2)]",
        latitude: 48.8566,
        longitude: 2.3522,
      },
    ],
  },
  {
    id: "2024-07-06",
    label: "Sat, 06 Jul",
    activities: [
      {
        id: "tower",
        title: "Eiffel Tower",
        color: "bg-[var(--color-3)]",
        latitude: 48.8584,
        longitude: 2.2945,
      },
    ],
  },
];

const meta = {
  title: "App/Planner/Map",
  component: MapView,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <main className="bg-card relative flex h-screen flex-1 flex-col overflow-hidden p-4 md:px-6 md:pb-8 xl:px-8">
        <div className="relative w-full flex-1 overflow-visible">
          <div className="absolute inset-0 z-0">
            <Story />
          </div>
        </div>
      </main>
    ),
  ],
  args: {
    days,
    destCoords: { lat: 48.8566, lng: 2.3522 },
    onActivitySelect: fn(),
    onDayHover: fn(),
    className: "h-full",
  },
} satisfies Meta<typeof MapView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoActivitiesOrDestination: Story = { args: { days: [], destCoords: null } };

export const DestinationOnly: Story = {
  args: { days: [], destCoords: { lat: 48.8566, lng: 2.3522 } },
};

export const ActivitiesWithoutCoordinates: Story = {
  args: {
    days: [
      {
        id: "2024-07-05",
        label: "Fri, 05 Jul",
        activities: [{ id: "unplaced", title: "Unplaced stop", color: "" }],
      },
    ],
    destCoords: null,
  },
};

export const HighlightedDay: Story = {
  args: { highlightedDayId: "2024-07-06" },
};

export const HighlightedActivity: Story = {
  args: { highlightedActivityId: "museum" },
};
