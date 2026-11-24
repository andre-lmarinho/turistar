import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import type { Activity, DayPlan } from "@/features/activity/types";

import { ActivityDialog } from "./ActivityDialog";

const firstActivity: Activity & { dayId: string } = {
  id: "activity-1",
  dayId: "2024-07-05",
  title: "Louvre Museum",
  color: "bg-[var(--color-1)]",
  description: "See the Mona Lisa and explore the galleries.",
  address: "Rue de Rivoli, Paris",
  duration: 3,
  budget: 25,
  latitude: 48.8606,
  longitude: 2.3376,
};

const days: DayPlan[] = [
  {
    id: "2024-07-05",
    label: "Fri, 05 Jul",
    activities: [firstActivity, { id: "activity-2", title: "Lunch", color: "bg-[var(--color-2)]" }],
  },
  { id: "2024-07-06", label: "Sat, 06 Jul", activities: [] },
];

const meta = {
  title: "App/Planner/ActivityDialog",
  component: ActivityDialog,
  parameters: { layout: "fullscreen" },
  args: {
    activity: firstActivity,
    days,
    onSave: fn(() => true),
    onDelete: fn(),
    onClose: fn(),
    onDayChange: fn(),
    onPositionChange: fn(),
    destCoords: { lat: 48.8566, lng: 2.3522 },
  },
} satisfies Meta<typeof ActivityDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NewActivity: Story = {
  args: { activity: { id: "new", dayId: "2024-07-05", title: "", color: "" }, onDelete: undefined },
};

export const DemoActivity: Story = { args: { isDemo: true, onDelete: undefined } };

export const TitleRequired: Story = {
  args: { activity: { id: "new", dayId: "2024-07-05", title: "", color: "" }, onDelete: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Done" }));
  },
};

export const InvalidNumbers: Story = {
  args: { activity: { ...firstActivity, duration: -1 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Done" }));
    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "Enter a valid number greater than or equal to zero."
    );
  },
};

export const SaveFailure: Story = {
  args: { onSave: fn(() => false) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    const notes = canvas.getByRole("textbox", { name: "Notes" });
    await userEvent.clear(notes);
    await userEvent.type(notes, "Updated notes");
    await userEvent.click(canvas.getByRole("button", { name: "Done" }));
    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "Could not save the activity. Please try again."
    );
  },
};

export const ChooseColor: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Card color" }));
  },
};

export const ChangeDay: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Fri, Jul 05" }));
  },
};

export const DeleteConfirmation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Delete" }));
  },
};
