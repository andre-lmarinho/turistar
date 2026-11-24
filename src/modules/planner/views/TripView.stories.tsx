import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import type { DayPlan } from "@/features/activity/types";

import { MapView } from "./MapView";
import { TripView } from "./TripView";

const days: DayPlan[] = [
  {
    id: "2024-07-05",
    label: "Fri, 05 Jul",
    activities: [
      {
        id: "museum",
        title: "Louvre Museum",
        color: "bg-[var(--color-1)]",
        description: "Reserve tickets ahead of time",
        startTime: "09:00",
      },
      { id: "lunch", title: "Lunch by the river", color: "bg-[var(--color-2)]", startTime: "13:00" },
    ],
  },
  { id: "2024-07-06", label: "Sat, 06 Jul", activities: [] },
];

const meta = {
  title: "App/Planner/Trip",
  component: TripView,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <main className="bg-card relative flex h-screen flex-1 flex-col overflow-hidden p-4 md:px-6 md:pb-8 xl:px-8">
        <div className="relative w-full flex-1 overflow-visible">
          <div className="absolute inset-0 z-0">
            <MapView
              days={days}
              destCoords={{ lat: 48.8566, lng: 2.3522 }}
              onActivitySelect={fn()}
              className="h-full"
            />
          </div>
          <div className="pointer-events-none absolute inset-0 z-10">
            <Story />
          </div>
        </div>
      </main>
    ),
  ],
  args: {
    days,
    onActivitySelect: fn(),
    onActivityMove: fn(),
    onFallbackAdd: fn(),
    onDayHover: fn(),
    onActivityHover: fn(),
  },
} satisfies Meta<typeof TripView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoDates: Story = { args: { days: [] } };

export const CollapsedDay: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const collapseButtons = canvas.getAllByRole("button", { name: "Collapse day" });
    await userEvent.click(collapseButtons[0]);
    await expect(collapseButtons[0]).toHaveAttribute("aria-expanded", "false");
  },
};

export const HiddenItinerary: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Hide itinerary" }));
    await expect(canvas.getByRole("button", { name: /Show itinerary/ })).toBeVisible();
  },
};
