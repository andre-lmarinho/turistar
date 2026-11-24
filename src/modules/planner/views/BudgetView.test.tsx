import type { QueryClient } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Activity } from "@/features/activity/types";
import type { BudgetQueryResult, Entry } from "@/features/budget/types";
import { BudgetView } from "./BudgetView";

const shared = vi.hoisted(() => ({
  createEntry: vi.fn<(input: { planId: string; payload: Omit<Entry, "id"> }) => Promise<string>>(),
  updateEntry: vi.fn<(input: { entry: Entry }) => Promise<void>>(),
  deleteEntry: vi.fn<(input: { entryId: string }) => Promise<void>>(),
  invalidate: vi.fn(),
  queryError: null as Error | null,
  refetchBudget: vi.fn(),
  client: null as QueryClient | null,
}));
vi.mock("@/trpc/react", async () => {
  const { useQuery, useMutation, useQueryClient } = await import("@tanstack/react-query");
  const key = ["budget"];
  return {
    trpc: {
      useUtils: () => {
        const client = useQueryClient();
        shared.client = client;
        return {
          viewer: {
            budget: {
              get: {
                cancel: () => client.cancelQueries({ queryKey: key }),
                getData: () => client.getQueryData<BudgetQueryResult>(key),
                setData: (
                  _input: unknown,
                  data:
                    | BudgetQueryResult
                    | undefined
                    | ((current: BudgetQueryResult | undefined) => BudgetQueryResult | undefined)
                ) => client.setQueryData<BudgetQueryResult>(key, data),
                invalidate: shared.invalidate,
              },
            },
          },
        };
      },
      viewer: {
        budget: {
          get: {
            useQuery: (_input: unknown, options: { initialData: BudgetQueryResult }) => {
              const query = useQuery({
                queryKey: key,
                queryFn: async () => options.initialData,
                initialData: options.initialData,
                enabled: false,
              });
              return {
                ...query,
                error: shared.queryError ?? query.error,
                refetch: shared.refetchBudget,
              };
            },
          },
          createEntry: {
            useMutation: () =>
              useMutation({
                mutationFn: (input: Parameters<typeof shared.createEntry>[0]) => shared.createEntry(input),
                retry: false,
              }),
          },
          updateEntry: {
            useMutation: () =>
              useMutation({
                mutationFn: (input: Parameters<typeof shared.updateEntry>[0]) => shared.updateEntry(input),
                retry: false,
              }),
          },
          deleteEntry: {
            useMutation: () =>
              useMutation({
                mutationFn: (input: Parameters<typeof shared.deleteEntry>[0]) => shared.deleteEntry(input),
                retry: false,
              }),
          },
        },
      },
    },
  };
});
const days = [
  {
    id: "day-1",
    label: "Mon, 05 Jul",
    activities: [
      { id: "activity-1", title: "Museum", color: "bg-[var(--color-1)]", budget: 40 } satisfies Activity,
    ],
  },
];
const entry: Entry = { id: "entry-1", description: "Airport transfer", category: "transport", amount: 85 };
beforeEach(() => {
  shared.createEntry.mockReset();
  shared.createEntry.mockResolvedValue("entry-2");
  shared.invalidate.mockReset();
  shared.queryError = null;
  shared.refetchBudget.mockReset().mockResolvedValue({});
  shared.updateEntry.mockReset().mockResolvedValue(undefined);
  shared.deleteEntry.mockReset().mockResolvedValue(undefined);
});
describe("BudgetView", () => {
  it("renders without initial budget entries", () => {
    render(<BudgetView planId="plan-1" days={[]} />);

    expect(screen.getByLabelText("Total spent: $0.00")).toBeInTheDocument();
    expect(screen.queryByText("No expenses yet")).not.toBeInTheDocument();
    expect(screen.getAllByRole("progressbar")).toHaveLength(6);
    expect(screen.getAllByRole("progressbar").every((bar) => bar.getAttribute("aria-valuenow") === "0")).toBe(
      true
    );
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
  });

  it("keeps the empty budget actionable if refreshing its server data fails", async () => {
    shared.queryError = new Error("Refresh failed");
    render(<BudgetView planId="plan-1" days={[]} initialEntries={[]} />);

    const alert = await screen.findByRole("alert");
    expect(alert).toBeVisible();
    expect(alert).toHaveClass("border-folio-error-border", "bg-folio-error/5");
    expect(screen.getByRole("button", { name: "Retry" })).toHaveClass("ml-auto");
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Dinner" } });
    fireEvent.change(screen.getByLabelText("Amount"), { target: { value: "45" } });
    fireEvent.click(screen.getByRole("button", { name: "Add expense" }));
    await waitFor(() => expect(shared.createEntry).toHaveBeenCalledOnce());

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(shared.refetchBudget).toHaveBeenCalledOnce();
  });

  it("shows total, categories, and entries", () => {
    render(<BudgetView planId="plan-1" days={days} initialEntries={[entry]} />);
    expect(screen.getByLabelText("Total spent: $125.00")).toBeInTheDocument();
    expect(screen.getAllByText("Transportation")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Tours & Activities")[0]).toBeInTheDocument();
    expect(screen.getByText("Airport transfer")).toBeInTheDocument();
  });

  it("keeps the expense row geometry and text position in edit mode", () => {
    render(<BudgetView planId="plan-1" days={[]} initialEntries={[entry]} />);
    const normalRow = screen.getByText("Airport transfer").closest("tr");
    expect(normalRow).toHaveClass("h-12");
    expect(normalRow?.querySelector("th")).toHaveClass("align-middle");

    fireEvent.click(screen.getByRole("button", { name: "Edit entry" }));
    const editRow = screen.getByRole("button", { name: "Save entry" }).closest("tr");
    if (!editRow) throw new Error("Missing expense editor row");
    expect(editRow).toHaveClass("h-12", "bg-folio-highlight");
    expect(within(editRow).getByLabelText("Description")).toHaveClass("h-9", "w-full");
    expect(within(editRow).getByLabelText("Category")).toHaveClass("h-9", "w-full");
    expect(within(editRow).getByLabelText("Amount")).toHaveClass("h-9", "w-full");
  });
  it("creates an expense from the table", async () => {
    render(<BudgetView planId="plan-1" days={days} initialEntries={[]} />);
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Dinner" } });
    fireEvent.change(screen.getByLabelText("Amount"), { target: { value: "45" } });
    fireEvent.click(screen.getByRole("button", { name: "Add expense" }));
    await waitFor(() =>
      expect(shared.createEntry).toHaveBeenCalledWith({
        planId: "plan-1",
        payload: { description: "Dinner", category: "transport", amount: 45 },
      })
    );
    expect(await screen.findByText("Dinner")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toHaveValue("");
    expect(screen.getByLabelText("Amount")).toHaveValue("");
  });

  it("uses refreshed cache entries directly", async () => {
    render(<BudgetView planId="plan-1" days={[]} initialEntries={[entry]} />);
    act(() => {
      shared.client?.setQueryData(["budget"], {
        budget: 0,
        entries: [{ ...entry, description: "Refreshed" }],
      });
    });
    expect(await screen.findByText("Refreshed")).toBeInTheDocument();
    expect(screen.queryByText("Airport transfer")).not.toBeInTheDocument();
  });

  it("saves fractions from the row draft without relying on blur", async () => {
    render(<BudgetView planId="plan-1" days={days} initialEntries={[entry]} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit entry" }));
    const row = screen.getByRole("button", { name: "Save entry" }).closest("tr");
    if (!row) throw new Error("Missing expense editor row");
    const amount = within(row).getByLabelText("Amount");
    fireEvent.change(amount, { target: { value: "0" } });
    expect(amount).toHaveValue("0");
    fireEvent.change(amount, { target: { value: "0.5" } });
    fireEvent.click(screen.getByRole("button", { name: "Save entry" }));
    await waitFor(() =>
      expect(shared.updateEntry).toHaveBeenCalledWith({ entry: { ...entry, amount: 0.5 } })
    );
    await waitFor(() => expect(screen.queryByRole("button", { name: "Save entry" })).not.toBeInTheDocument());
    expect(screen.getByLabelText("Total spent: $40.50")).toBeInTheDocument();
  });

  it("rolls back failed optimistic updates and keeps the draft for retry", async () => {
    let fail!: (reason: Error) => void;
    shared.updateEntry.mockImplementationOnce(
      () =>
        new Promise<void>((_, reject) => {
          fail = reject;
        })
    );
    render(<BudgetView planId="plan-1" days={days} initialEntries={[entry]} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit entry" }));
    fireEvent.change(screen.getAllByLabelText("Amount")[0], { target: { value: "10" } });
    fireEvent.click(screen.getByRole("button", { name: "Save entry" }));
    await waitFor(() => expect(screen.getByLabelText("Total spent: $50.00")).toBeInTheDocument());
    await act(async () => fail(new Error("offline")));
    const error = await screen.findByRole("alert");
    expect(error).toHaveTextContent("We couldn't save this expense");
    expect(error.closest("table")).not.toBeInTheDocument();
    expect(within(error).getByRole("listitem")).toHaveTextContent(
      "We couldn't save this expense. Your details are still here; try again."
    );
    expect(screen.getByLabelText("Total spent: $125.00")).toBeInTheDocument();
    expect(shared.client?.getQueryData<BudgetQueryResult>(["budget"])?.entries).toEqual([entry]);
    expect(screen.getAllByLabelText("Amount")[0]).toHaveValue("10");
    fireEvent.click(screen.getByRole("button", { name: "Save entry" }));
    await waitFor(() => expect(shared.updateEntry).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryByRole("button", { name: "Save entry" })).not.toBeInTheDocument());
  });

  it.each(["cancel", "snapshot"])("allows saving again after %s preparation fails", async (stage) => {
    render(<BudgetView planId="plan-1" days={[]} initialEntries={[entry]} />);
    const client = shared.client;
    if (!client) throw new Error("Missing budget query client");
    if (stage === "cancel") vi.spyOn(client, "cancelQueries").mockRejectedValueOnce(new Error("Unavailable"));
    else
      vi.spyOn(client, "getQueryData").mockImplementationOnce(() => {
        throw new Error("Unavailable");
      });

    fireEvent.click(screen.getByRole("button", { name: "Edit entry" }));
    fireEvent.change(screen.getAllByLabelText("Amount")[0], { target: { value: "10" } });
    fireEvent.click(screen.getByRole("button", { name: "Save entry" }));
    const error = await screen.findByRole("alert");
    expect(error).toHaveTextContent("We couldn't save this expense");
    expect(error.closest("table")).not.toBeInTheDocument();
    expect(shared.updateEntry).not.toHaveBeenCalled();
    expect(client.getQueryData<BudgetQueryResult>(["budget"])?.entries).toEqual([entry]);
    expect(screen.getByRole("button", { name: "Save entry" })).toBeEnabled();
    expect(screen.getAllByLabelText("Amount")[0]).toHaveValue("10");

    fireEvent.click(screen.getByRole("button", { name: "Save entry" }));
    await waitFor(() =>
      expect(shared.updateEntry).toHaveBeenCalledExactlyOnceWith({ entry: { ...entry, amount: 10 } })
    );
    await waitFor(() => expect(screen.queryByRole("button", { name: "Save entry" })).not.toBeInTheDocument());
  });

  it("shows delete preparation failures in the row and allows retry", async () => {
    render(<BudgetView planId="plan-1" days={[]} initialEntries={[entry]} />);
    const client = shared.client;
    if (!client) throw new Error("Missing budget query client");
    vi.spyOn(client, "cancelQueries").mockRejectedValueOnce(new Error("Unavailable"));

    const deleteButton = screen.getByRole("button", { name: "Delete entry" });
    fireEvent.click(deleteButton);
    fireEvent.click(await screen.findByRole("button", { name: "Delete" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not delete the expense");
    expect(shared.deleteEntry).not.toHaveBeenCalled();
    expect(client.getQueryData<BudgetQueryResult>(["budget"])?.entries).toEqual([entry]);

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(shared.deleteEntry).toHaveBeenCalledExactlyOnceWith({ entryId: entry.id }));
    await waitFor(() => expect(screen.queryByText("Airport transfer")).not.toBeInTheDocument());
  });

  it("keeps the row visible while deleting and shows persistence errors inline", async () => {
    let fail!: (reason: Error) => void;
    shared.deleteEntry.mockImplementationOnce(
      () =>
        new Promise<void>((_, reject) => {
          fail = reject;
        })
    );
    render(<BudgetView planId="plan-1" days={[]} initialEntries={[entry]} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete entry" }));
    expect(shared.deleteEntry).not.toHaveBeenCalled();
    fireEvent.click(await screen.findByRole("button", { name: "Delete" }));
    await waitFor(() => expect(shared.deleteEntry).toHaveBeenCalledOnce());
    const row = screen.getByRole("button", { name: "Working…" }).closest("tr");
    expect(row).toBeInTheDocument();
    await act(async () => fail(new Error("offline")));
    const error = await screen.findByRole("alert");
    expect(error).toHaveTextContent("Could not delete the expense");
    expect(error.closest("tr")).toBe(row);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(await screen.findByText("Airport transfer")).toBeInTheDocument();
  });

  it("explains invalid entries and focuses the first invalid field", () => {
    render(<BudgetView planId="plan-1" days={[]} initialEntries={[]} />);
    fireEvent.click(screen.getByRole("button", { name: "Add expense" }));
    const description = screen.getByLabelText("Description");
    expect(description).toHaveFocus();
    expect(description).toHaveAttribute("aria-invalid", "true");
    expect(description).toHaveClass("border-folio-error-border");
    expect(screen.getByLabelText("Amount")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Amount")).toHaveClass("border-folio-error-border");
    const errors = screen.getByRole("alert");
    expect(errors).toHaveClass("flex-col");
    expect(errors.closest("table")).not.toBeInTheDocument();
    expect(within(errors).getAllByRole("listitem")).toHaveLength(2);
    expect(within(errors).getByText("Enter an expense description.")).toBeInTheDocument();
    expect(within(errors).getByText("Enter a valid amount greater than zero.")).toBeInTheDocument();
    expect(errors.querySelectorAll("svg")).toHaveLength(2);
    expect(description).toHaveAttribute("aria-describedby", expect.stringContaining("expense-validation"));
    expect(shared.createEntry).not.toHaveBeenCalled();
    fireEvent.change(description, { target: { value: "Dinner" } });
    fireEvent.click(screen.getByRole("button", { name: "Add expense" }));
    expect(screen.getByLabelText("Amount")).toHaveFocus();
  });

  it("shows failed creates on the add row and keeps the draft for retry", async () => {
    shared.createEntry.mockRejectedValueOnce(new Error("offline"));
    render(<BudgetView planId="plan-1" days={[]} initialEntries={[]} />);
    const description = screen.getByLabelText("Description");
    const amount = screen.getByLabelText("Amount");
    fireEvent.change(description, { target: { value: "Dinner" } });
    fireEvent.change(amount, { target: { value: "45" } });
    fireEvent.click(screen.getByRole("button", { name: "Add expense" }));

    const error = await screen.findByRole("alert");
    const addRow = screen.getByRole("button", { name: "Add expense" }).closest("tr");
    expect(error).toHaveTextContent("We couldn't save this expense. Your details are still here; try again.");
    expect(error.closest("table")).not.toBeInTheDocument();
    expect(error.closest("section")).toBe(addRow?.closest("section")?.parentElement);
    expect(description).toHaveValue("Dinner");
    expect(amount).toHaveValue("45");
  });

  it("saves the row from Enter and prevents duplicate submissions", async () => {
    let resolve!: (id: string) => void;
    shared.createEntry.mockImplementationOnce(
      () =>
        new Promise<string>((done) => {
          resolve = done;
        })
    );
    render(<BudgetView planId="plan-1" days={[]} initialEntries={[]} />);
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Dinner" } });
    const amount = screen.getByLabelText("Amount");
    fireEvent.change(amount, { target: { value: "20" } });
    fireEvent.keyDown(amount, { key: "Enter" });
    fireEvent.keyDown(amount, { key: "Enter" });
    await waitFor(() => expect(shared.createEntry).toHaveBeenCalledOnce());
    expect(screen.getByRole("button", { name: "Add expense" })).toHaveAttribute("aria-busy", "true");
    expect(amount).toHaveAttribute("readonly");
    await act(async () => resolve("dinner"));
    expect(await screen.findByText("Dinner")).toBeInTheDocument();
  });
});
