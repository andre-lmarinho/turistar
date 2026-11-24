import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import type { DayPlan } from "@/features/activity/types";

import { BoardView } from "./BoardView";

const days: DayPlan[] = [
  {
    id: "2024-07-05",
    label: "Fri, 05 Jul",
    activities: [
      {
        id: "activity-1",
        title: "Explore the old town",
        color: "bg-[var(--color-1)]",
        description: "Walk through the historic center",
        duration: 2,
        budget: 25,
      },
      { id: "activity-2", title: "Lunch by the river", color: "bg-[var(--color-2)]" },
    ],
  },
  { id: "2024-07-06", label: "Sat, 06 Jul", activities: [] },
];

const meta = {
  title: "App/Planner/Board",
  component: BoardView,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <main className="bg-card relative flex h-screen flex-1 flex-col overflow-hidden p-4 md:px-6 md:pb-8 xl:px-8">
        <div className="relative w-full flex-1 overflow-visible">
          <div className="absolute inset-0">
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
  },
} satisfies Meta<typeof BoardView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DayWithoutActivities: Story = {
  args: {
    days: [{ id: "2024-07-05", label: "Fri, 05 Jul", activities: [] }],
  },
};

export const NoDays: Story = { args: { days: [] } };
