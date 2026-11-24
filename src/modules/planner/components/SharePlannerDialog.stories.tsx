import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { within } from "storybook/test";
import { SharePlannerDialog } from "./SharePlannerDialog";

const meta = {
  title: "App/Planner/SharePlannerDialog",
  component: SharePlannerDialog,
  parameters: { nextjs: { appDirectory: true } },
  args: {
    planId: "demo-plan",
    canManageMembers: true,
    viewerUserId: "demo-owner",
  },
} satisfies Meta<typeof SharePlannerDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Share planner" }));
  },
};

export const ReadOnly: Story = {
  args: { canManageMembers: false, viewerUserId: "demo-member" },
  play: Default.play,
};
