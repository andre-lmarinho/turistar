import { describe, expect, it, vi } from "vitest";

import { fetchSnapshot as fetchSnapshotRepository } from "../repositories/SnapshotsRepository";
import { fetchSnapshot } from "./snapshotsQueries";

vi.mock("@/features/snapshots/repositories/SnapshotsRepository", () => ({
  fetchSnapshot: vi.fn(),
}));

describe("fetchSnapshot", () => {
  it("returns the default empty snapshot when no row exists", async () => {
    vi.mocked(fetchSnapshotRepository).mockResolvedValueOnce(null);

    await expect(fetchSnapshot("plan-1")).resolves.toEqual({
      version: 0,
      days: [],
      updatedAt: new Date(0).toISOString(),
    });
    expect(fetchSnapshotRepository).toHaveBeenCalledWith("plan-1", { client: undefined });
  });

  it("parses and normalizes the persisted snapshot row", async () => {
    const persisted = {
      plan_id: "plan-1",
      version: 3,
      updated_at: "2024-01-01T00:00:00.000Z",
      state: {
        days: [
          {
            id: "day-1",
            label: "Day 1",
            activities: [
              {
                id: "activity-1",
                title: "Visit museum",
                color: "bg-blue-500",
              },
            ],
          },
        ],
      },
    };

    vi.mocked(fetchSnapshotRepository).mockResolvedValueOnce(persisted);

    await expect(fetchSnapshot("plan-1")).resolves.toEqual({
      version: 3,
      updatedAt: "2024-01-01T00:00:00.000Z",
      days: [
        {
          id: "day-1",
          label: "Day 1",
          position: "1024",
          activities: [
            {
              id: "activity-1",
              title: "Visit museum",
              color: "bg-blue-500",
              position: "1024",
            },
          ],
        },
      ],
    });
  });
});
