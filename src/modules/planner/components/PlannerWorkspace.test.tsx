import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { updatePlanTitle } from "@/features/app/planner/server/actions/plans/updatePlanTitle";
import { PlannerWorkspace } from "@/modules/planner/components/PlannerWorkspace";

vi.mock("@/features/app/planner/server/actions/plans/updatePlanTitle", () => ({
  updatePlanTitle: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/features/app/planner/hooks/PlannerContext", () => ({
  PlannerProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  usePlannerContext: () => ({
    planId: "p1",
    currentRange: undefined,
    handleRangeChange: vi.fn(),
    viewerUserId: null,
  }),
}));

vi.mock("@/features/app/planner/components/dnd/PlannerBoard", () => ({
  PlannerBoard: () => <div data-testid="planner-board" />,
}));

vi.mock("@/features/app/planner/components/budget/BudgetBoard", () => ({
  BudgetBoard: () => <div data-testid="budget-board" />,
}));

vi.mock("@/features/app/planner/components/map/MapBoard", () => ({
  __esModule: true,
  default: () => <div data-testid="map-board" />,
}));

vi.mock("@/features/app/planner/components/dialog/ActivityDialog", () => ({
  ActivityDialog: () => null,
}));

vi.mock("@/features/share/components/SharePlannerDialog", () => ({
  SharePlannerDialog: () => null,
}));

vi.mock("@/features/app/planner/components/ui/ModeToggleButton", () => ({
  ModeToggleButton: ({ onChange }: { onChange: (mode: "planner" | "map" | "budget") => void }) => (
    <button type="button" onClick={() => onChange("map")}>
      Toggle
    </button>
  ),
}));

vi.mock("@/shared/ui/calendar", () => ({
  DateRangePickerIcon: () => null,
}));

const updatePlanTitleMock = vi.mocked(updatePlanTitle);

describe("PlannerWorkspace", () => {
  it("restores the initial title when blurred empty", async () => {
    render(<PlannerWorkspace planId="p1" title="Trip" editToken="token" />);

    const input = screen.getByLabelText("Planner title");
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.blur(input);

    await waitFor(() => expect(input).toHaveValue("Trip"));
    expect(updatePlanTitleMock).not.toHaveBeenCalled();
  });

  it("persists the title on blur when editable", async () => {
    render(<PlannerWorkspace planId="p1" title="Trip" editToken="token" />);

    const input = screen.getByLabelText("Planner title");
    fireEvent.change(input, { target: { value: "New Title" } });
    fireEvent.blur(input);

    await waitFor(() => expect(updatePlanTitleMock).toHaveBeenCalledWith("p1", "token", "New Title"));
  });
});
