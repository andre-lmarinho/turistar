import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

import type { Activity, DayPlan } from "@/features/activity/types";
import type { PlannerExperience } from "@/features/plan/services/PlanService";
import type { PlannerMode } from "./components/ModeToggleButton";
import { PlanIdView } from "./planid-view";

const { updatePlanTitleMock, createActivityMock, discardPendingMock, documentState } = vi.hoisted(() => ({
  createActivityMock: vi.fn(),
  discardPendingMock: vi.fn(),
  documentState: { days: [] as DayPlan[], error: null as Error | null, hasPendingChanges: false },
  updatePlanTitleMock: vi.fn().mockResolvedValue(undefined),
}));

const experience = {
  planId: "p1",
  destination: "Trip",
  viewerUserId: null,
  isDemo: false,
  isOwner: false,
  canManageMembers: false,
  initialDays: [],
  initialEntries: [],
} satisfies PlannerExperience;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/trpc/react", () => ({
  trpc: { viewer: { plan: { updateTitle: { useMutation: () => ({ mutateAsync: updatePlanTitleMock }) } } } },
}));

vi.mock("@/modules/planner/hooks/usePlannerDocument", () => ({
  usePlannerDocument: () => ({
    planId: "p1",
    ...documentState,
    discardPending: discardPendingMock,
    createActivity: createActivityMock,
    updateActivity: vi.fn(),
    deleteActivity: vi.fn(),
    moveActivity: vi.fn(),
    dest: "Trip",
    destCoords: null,
    currentRange: undefined,
    handleRangeChange: vi.fn(),
  }),
}));

vi.mock("@/modules/planner/views/BudgetView", () => ({
  BudgetView: () => <div data-testid="budget-board" />,
}));

vi.mock("@/modules/planner/views/MapView", () => ({
  __esModule: true,
  default: () => <div data-testid="map-board" />,
}));

vi.mock("@/modules/planner/components/ActivityDialog", () => ({
  ActivityDialog: ({
    activity,
    onSave,
  }: {
    activity: Activity | null;
    onSave: (patch: Partial<Activity>) => void;
  }) =>
    activity ? (
      <div>
        <span data-testid="editor-title">{activity.title}</span>
        <button type="button" onClick={() => onSave({ budget: 25, color: "blue" })}>
          Set draft details
        </button>
        <button type="button" onClick={() => onSave({ title: "New museum" })}>
          Name draft
        </button>
      </div>
    ) : null,
}));

vi.mock("@/modules/planner/components/SharePlannerDialog", () => ({
  SharePlannerDialog: () => null,
}));

vi.mock("@/modules/planner/components/DeletePlanDialog", () => ({
  DeletePlanDialog: () => null,
}));

vi.mock("@/modules/planner/components/ModeToggleButton", () => ({
  modeOrder: ["planner", "map", "budget"] as const,
  ModeToggleButton: ({ onChange }: { onChange: (mode: PlannerMode) => void }) => (
    <button type="button" onClick={() => onChange("map")}>
      Toggle
    </button>
  ),
}));

vi.mock("@/ui/components/calendar", () => ({
  DateRangePickerIcon: () => null,
}));

beforeEach(() => {
  vi.clearAllMocks();
  createActivityMock.mockImplementation((_dayId: string, activity: Activity) =>
    Boolean(activity.title.trim())
  );
  documentState.days = [{ id: "day-1", label: "Day 1", activities: [] }];
  documentState.error = null;
  documentState.hasPendingChanges = false;
});
afterEach(() => vi.restoreAllMocks());

describe("PlanIdView", () => {
  it("restores the initial title when blurred empty", async () => {
    render(<PlanIdView experience={experience} />);

    const input = screen.getByLabelText("Planner title");
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.blur(input);

    await waitFor(() => expect(input).toHaveValue("Trip"));
    expect(updatePlanTitleMock).not.toHaveBeenCalled();
  });

  it("persists the title on blur when editable", async () => {
    render(<PlanIdView experience={experience} />);

    const input = screen.getByLabelText("Planner title");
    fireEvent.change(input, { target: { value: "New Title" } });
    fireEvent.blur(input);

    await waitFor(() =>
      expect(updatePlanTitleMock).toHaveBeenCalledWith({ planId: "p1", title: "New Title" })
    );
  });
});

it("preserves edits made to a new activity before its title is entered", () => {
  render(<PlanIdView experience={experience} />);
  fireEvent.click(screen.getAllByRole("button", { name: /add activity/i })[0]);
  fireEvent.click(screen.getByRole("button", { name: "Set draft details" }));
  expect(createActivityMock).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Name draft" }));
  expect(createActivityMock).toHaveBeenCalledWith(
    "day-1",
    expect.objectContaining({ title: "New museum", budget: 25, color: "blue" })
  );
});

it("keeps the draft and its fields when creation is rejected", () => {
  createActivityMock.mockReturnValue(false);
  render(<PlanIdView experience={experience} />);
  fireEvent.click(screen.getAllByRole("button", { name: /add activity/i })[0]);
  fireEvent.click(screen.getByRole("button", { name: "Set draft details" }));
  fireEvent.click(screen.getByRole("button", { name: "Name draft" }));
  expect(screen.getByTestId("editor-title")).toHaveTextContent("New museum");
  createActivityMock.mockReturnValue(true);
  fireEvent.click(screen.getByRole("button", { name: "Name draft" }));
  expect(createActivityMock).toHaveBeenLastCalledWith(
    "day-1",
    expect.objectContaining({ title: "New museum", budget: 25, color: "blue" })
  );
});

it.each([true, false])("clears the editor only after confirming discard (%s)", (confirmed) => {
  documentState.days[0].activities = [{ id: "a1", title: "Saved activity", color: "blue" }];
  documentState.error = new Error("Failed to sync");
  documentState.hasPendingChanges = true;
  vi.spyOn(window, "confirm").mockReturnValue(confirmed);
  render(<PlanIdView experience={experience} />);
  fireEvent.click(screen.getAllByText("Saved activity")[0]);
  expect(screen.getByTestId("editor-title")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Discard unsynced changes" }));
  expect(discardPendingMock).toHaveBeenCalledTimes(confirmed ? 1 : 0);
  if (confirmed) expect(screen.queryByTestId("editor-title")).not.toBeInTheDocument();
  else expect(screen.getByTestId("editor-title")).toBeInTheDocument();
});
