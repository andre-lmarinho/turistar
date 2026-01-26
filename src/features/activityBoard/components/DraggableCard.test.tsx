import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Activity } from "@/features/activity/types";

import { DraggableCard } from "./DraggableCard";

const shared = vi.hoisted(() => ({
  setNodeRef: vi.fn(),
}));

vi.mock("@dnd-kit/sortable", () => ({
  useSortable: () => ({
    attributes: { "data-attr": "true" },
    listeners: { onPointerDown: vi.fn() },
    setNodeRef: shared.setNodeRef,
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
}));

vi.mock("./ActivityCard", () => ({
  ActivityCard: (props: { activity: Activity; onSelect?: () => void; bgColor?: string }) => (
    <button
      type="button"
      data-testid="activity-card"
      data-activity-id={props.activity.id}
      onClick={props.onSelect}
    />
  ),
}));

const baseActivity: Activity = {
  id: "a1",
  title: "Walk",
  color: "bg-[var(--color-1)]",
};

describe("DraggableCard", () => {
  it("calls onSelect when ActivityCard is clicked", () => {
    const handleSelect = vi.fn();

    render(<DraggableCard id={baseActivity.id} activity={baseActivity} onSelect={handleSelect} />);

    fireEvent.click(screen.getByTestId("activity-card"));

    expect(handleSelect).toHaveBeenCalledTimes(1);
  });

  it("renders overlay without drag scroll attributes", () => {
    const { container } = render(<DraggableCard id={baseActivity.id} activity={baseActivity} dragOverlay />);

    expect(container.querySelector("[data-no-drag-scroll]")).toBeNull();
  });
});
