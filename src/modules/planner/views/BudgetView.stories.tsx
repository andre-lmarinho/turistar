import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import type { DayPlan } from "@/features/activity/types";
import type { Entry } from "@/features/budget/types";

import { BudgetScreen } from "./BudgetView";

const expenses: Entry[] = [
  { id: "expense-1", description: "Airport transfer", category: "transport", amount: 85 },
  { id: "expense-2", description: "Dinner by the river", category: "food", amount: 42.5 },
  { id: "expense-3", description: "Museum tickets", category: "activities", amount: 28 },
];

const days: DayPlan[] = [
  {
    id: "day-1",
    label: "Mon, 05 Jul",
    activities: [{ id: "activity-1", title: "Old town walk", color: "bg-[var(--color-1)]", budget: 40 }],
  },
];

const meta = {
  title: "App/Planner/Budget",
  component: BudgetScreen,
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
    days: [],
    entries: [],
    loadError: false,
    isFetching: false,
    onRetry: fn(),
    isPending: false,
    onSave: fn(async () => true),
    onDelete: fn(async () => {}),
  },
} satisfies Meta<typeof BudgetScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { days, entries: expenses },
};

export const NoExpenses: Story = {};

export const FetchError: Story = {
  args: { days, entries: expenses, loadError: true },
};

export const FetchRetrying: Story = {
  args: { days, entries: expenses, loadError: true, isFetching: true },
};

export const SavePending: Story = {
  args: { onSave: fn(() => new Promise<boolean>(() => {})) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("Description"), "Coffee");
    await userEvent.type(canvas.getByLabelText("Amount"), "6.5");
    await userEvent.click(canvas.getByRole("button", { name: "Add expense" }));
    await expect(canvas.getByRole("button", { name: "Add expense" })).toHaveAttribute("aria-busy", "true");
  },
};

export const AddValidationErrors: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Add expense" }));
    await expect(canvas.getAllByRole("alert")).toHaveLength(1);
    await expect(canvas.getByText("Enter an expense description.")).toBeVisible();
    await expect(canvas.getByText("Enter a valid amount greater than zero.")).toBeVisible();
  },
};

export const SaveError: Story = {
  args: { onSave: fn(async () => false) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const description = canvas.getByLabelText("Description");
    const amount = canvas.getByLabelText("Amount");
    await userEvent.type(description, "Dinner");
    await userEvent.type(amount, "45");
    await userEvent.click(canvas.getByRole("button", { name: "Add expense" }));
    const error = await canvas.findByRole("alert");
    await expect(error).toHaveTextContent(
      "We couldn't save this expense. Your details are still here; try again."
    );
    await expect(error.closest("tr")).toBe(canvas.getByRole("button", { name: "Add expense" }).closest("tr"));
    await expect(description).toHaveValue("Dinner");
    await expect(amount).toHaveValue("45");
  },
};

export const EditingExpense: Story = {
  args: { entries: expenses },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getAllByRole("button", { name: "Edit entry" })[0]);
  },
};

export const DeleteConfirmation: Story = {
  args: { entries: expenses },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getAllByRole("button", { name: "Delete entry" })[0]);
    await expect(canvas.getByText("Delete Airport transfer? This cannot be undone.")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Delete" })).toBeVisible();
  },
};

export const DeletePending: Story = {
  args: {
    entries: expenses,
    onDelete: fn(() => new Promise<void>(() => {})),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getAllByRole("button", { name: "Delete entry" })[0]);
    const confirm = canvas.getByRole("button", { name: "Delete" });
    await userEvent.click(confirm);
    await expect(canvas.getByRole("button", { name: "Working…" })).toHaveAttribute("aria-busy", "true");
  },
};

export const DeleteError: Story = {
  args: {
    entries: expenses,
    onDelete: fn(async () => {
      throw new Error("Delete failed");
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getAllByRole("button", { name: "Delete entry" })[0]);
    await userEvent.click(canvas.getByRole("button", { name: "Delete" }));
    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "Could not delete the expense. Please try again."
    );
  },
};
