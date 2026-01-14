import { fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { vi } from "vitest";
import type { Entry } from "@/features/app/planner/types/budget";
import { BudgetRowView } from "./BudgetRowView";

function renderInTable(node: React.ReactNode) {
  return render(
    <table>
      <tbody>{node}</tbody>
    </table>
  );
}

describe("BudgetRowView", () => {
  it("calls onEdit when the edit button is clicked", () => {
    const onEdit = vi.fn();
    const entry: Entry = { id: "1", description: "Hotel", category: "lodging", amount: 120 };

    renderInTable(<BudgetRowView index={0} entry={entry} onEdit={onEdit} onDelete={vi.fn()} />);

    fireEvent.click(screen.getByLabelText("Edit entry"));

    expect(onEdit).toHaveBeenCalledWith(0);
  });

  it("calls onDelete when the delete button is clicked", () => {
    const onDelete = vi.fn();
    const entry: Entry = { id: "2", description: "Dinner", category: "food", amount: 40 };

    renderInTable(<BudgetRowView index={3} entry={entry} onEdit={vi.fn()} onDelete={onDelete} />);

    fireEvent.click(screen.getByLabelText("Delete entry"));

    expect(onDelete).toHaveBeenCalledWith(3);
  });
});
