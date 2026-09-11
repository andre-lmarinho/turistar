import { act, renderHook, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import type { DayPlan } from "@/features/activity/types";
import type { EventInsert, EventRecord, PlanOperation } from "@/features/events/types";
import type { Snapshot } from "@/features/snapshots/types";
import { usePlanCollaboration } from "./usePlanCollaboration";

type AppendInput = { planId: string; baseVersion: number; events: EventInsert[] };
type AppendResult = { version: number; events: EventRecord[] };
const mocks = vi.hoisted(() => {
  const fetchSnapshot = vi.fn<(input: { planId: string }) => Promise<Snapshot>>();
  const fetchEvents = vi.fn<(input: { planId: string; sinceVersion: number }) => Promise<EventRecord[]>>();
  const appendEvents = vi.fn<(input: AppendInput) => Promise<AppendResult>>();
  const subscribe =
    vi.fn<
      (
        planId: string,
        handler: (event: EventRecord) => void,
        client?: unknown,
        onReady?: () => void
      ) => { unsubscribe: () => void }
    >();
  return {
    fetchSnapshot,
    fetchEvents,
    appendEvents,
    subscribe,
    utils: {
      viewer: { snapshots: { get: { fetch: fetchSnapshot } }, events: { list: { fetch: fetchEvents } } },
    },
    mutation: { mutateAsync: appendEvents },
  };
});
vi.mock("@/trpc/react", () => ({
  trpc: {
    useUtils: () => mocks.utils,
    viewer: { events: { append: { useMutation: () => mocks.mutation } } },
  },
}));
vi.mock("@/features/events/services/eventsRealtimeClient", () => ({ subscribeToEvents: mocks.subscribe }));

const day: DayPlan = {
  id: "2026-09-10",
  label: "Day 1",
  position: "1024",
  activities: [{ id: "a1", title: "Breakfast", color: "bg-[var(--color-1)]", position: "1024" }],
};
const snapshot = (version = 1, days = [day]): Snapshot => ({
  version,
  days,
  updatedAt: new Date(0).toISOString(),
});
const update = (title: string): PlanOperation[] => [
  { type: "activity.updated", payload: { activityId: "a1", patch: { title } } },
];
function stored(input: AppendInput): AppendResult {
  return {
    version: input.baseVersion + input.events.length,
    events: input.events.map((event, index) => ({
      ...event,
      version: input.baseVersion + index + 1,
      createdAt: new Date(0).toISOString(),
    })),
  };
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
const remote: EventRecord = {
  id: "remote-1",
  planId: "p1",
  version: 2,
  createdAt: new Date(0).toISOString(),
  type: "activity.updated",
  payload: { activityId: "a1", patch: { description: "Remote note" } },
};
function emit(event: EventRecord) {
  act(() => mocks.subscribe.mock.calls.at(-1)?.[1](event));
}
async function loaded() {
  const hook = renderHook(() => usePlanCollaboration("p1"));
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  return hook;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.fetchSnapshot.mockReset().mockResolvedValue(snapshot());
  mocks.fetchEvents.mockReset().mockResolvedValue([]);
  mocks.appendEvents.mockReset().mockImplementation(async (input) => stored(input));
  mocks.subscribe.mockReset().mockReturnValue({ unsubscribe: vi.fn() });
});

describe("usePlanCollaboration", () => {
  test("renders edits immediately while append waits without inventing a confirmed version", async () => {
    const response = deferred<AppendResult>();
    mocks.appendEvents.mockReturnValue(response.promise);
    const { result } = await loaded();
    act(() => result.current.dispatch(() => update("Local title")));
    expect(result.current.data[0].activities[0].title).toBe("Local title");
    expect(result.current.version).toBe(1);
    expect(result.current.hasPendingChanges).toBe(true);
    await waitFor(() => expect(mocks.appendEvents).toHaveBeenCalledTimes(1));
    expect(result.current.isPending).toBe(true);
    await act(async () => response.resolve(stored(mocks.appendEvents.mock.calls[0][0])));
    await waitFor(() => expect(result.current.hasPendingChanges).toBe(false));
    expect(result.current.version).toBe(2);
  });

  test("serializes requests while preserving a second edit when the first is acknowledged", async () => {
    const first = deferred<AppendResult>();
    const second = deferred<AppendResult>();
    mocks.appendEvents.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const { result } = await loaded();
    act(() => result.current.dispatch(() => update("First")));
    await waitFor(() => expect(mocks.appendEvents).toHaveBeenCalledTimes(1));
    act(() => result.current.dispatch((days) => update(`${days[0].activities[0].title} then second`)));
    expect(result.current.data[0].activities[0].title).toBe("First then second");
    expect(mocks.appendEvents).toHaveBeenCalledTimes(1);
    await act(async () => first.resolve(stored(mocks.appendEvents.mock.calls[0][0])));
    await waitFor(() => expect(mocks.appendEvents).toHaveBeenCalledTimes(2));
    expect(result.current.data[0].activities[0].title).toBe("First then second");
    expect(mocks.appendEvents.mock.calls[1][0].baseVersion).toBe(2);
    await act(async () => second.resolve(stored(mocks.appendEvents.mock.calls[1][0])));
    await waitFor(() => expect(result.current.hasPendingChanges).toBe(false));
  });

  test.each([true, false])(
    "deduplicates realtime and HTTP acknowledgements (realtime first: %s)",
    async (realtimeFirst) => {
      const response = deferred<AppendResult>();
      mocks.appendEvents.mockReturnValue(response.promise);
      const { result } = await loaded();
      act(() => result.current.dispatch(() => update("Local")));
      await waitFor(() => expect(mocks.appendEvents).toHaveBeenCalledTimes(1));
      const accepted = stored(mocks.appendEvents.mock.calls[0][0]);
      if (realtimeFirst) emit(accepted.events[0]);
      await act(async () => response.resolve(accepted));
      if (!realtimeFirst) emit(accepted.events[0]);
      emit(accepted.events[0]);
      await waitFor(() => expect(result.current.hasPendingChanges).toBe(false));
      expect(result.current.data[0].activities[0].title).toBe("Local");
      expect(result.current.version).toBe(2);
      expect(mocks.appendEvents).toHaveBeenCalledTimes(1);
    }
  );

  test("keeps remote fields and pending local edits across a version conflict", async () => {
    const response = deferred<AppendResult>();
    mocks.appendEvents.mockReturnValueOnce(response.promise);
    const { result } = await loaded();
    act(() => result.current.dispatch(() => update("Local")));
    await waitFor(() => expect(mocks.appendEvents).toHaveBeenCalledTimes(1));
    emit(remote);
    expect(result.current.data[0].activities[0]).toMatchObject({
      title: "Local",
      description: "Remote note",
    });
    expect(result.current.version).toBe(2);
    mocks.fetchEvents.mockResolvedValue([remote]);
    await act(async () => response.resolve({ version: 2, events: [] }));
    await waitFor(() => expect(result.current.hasPendingChanges).toBe(false));
    expect(mocks.appendEvents).toHaveBeenCalledTimes(2);
    expect(mocks.appendEvents.mock.calls[1][0].baseVersion).toBe(2);
    expect(result.current.data[0].activities[0]).toMatchObject({
      title: "Local",
      description: "Remote note",
    });
  });

  test("retains failed edits and retries the same IDs only after explicit retry", async () => {
    mocks.appendEvents.mockRejectedValueOnce(new Error("Network unavailable"));
    const { result } = await loaded();
    act(() => result.current.dispatch(() => update("Keep me")));
    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.data[0].activities[0].title).toBe("Keep me");
    expect(result.current.hasPendingChanges).toBe(true);
    expect(mocks.appendEvents).toHaveBeenCalledTimes(1);
    const sent = mocks.appendEvents.mock.calls[0][0].events;
    await act(async () => result.current.retryPending());
    await waitFor(() => expect(result.current.hasPendingChanges).toBe(false));
    expect(mocks.appendEvents.mock.calls[1][0].events).toEqual(sent);
    expect(mocks.fetchEvents.mock.calls.at(-1)?.[0].sinceVersion).toBe(1);
  });

  test("acknowledges a committed batch after a lost response without sending it twice", async () => {
    mocks.appendEvents.mockRejectedValueOnce(new Error("Response lost"));
    const { result } = await loaded();
    act(() => result.current.dispatch(() => update("Already saved")));
    await waitFor(() => expect(result.current.error).toBeTruthy());
    const accepted = stored(mocks.appendEvents.mock.calls[0][0]);
    mocks.fetchEvents.mockResolvedValue(accepted.events);
    await act(async () => result.current.retryPending());
    expect(result.current.hasPendingChanges).toBe(false);
    expect(result.current.data[0].activities[0].title).toBe("Already saved");
    expect(result.current.version).toBe(2);
    expect(mocks.appendEvents).toHaveBeenCalledTimes(1);
  });

  test("keeps early edits visible while initial loading and rebases them onto remote data", async () => {
    const initial = deferred<Snapshot>();
    const response = deferred<AppendResult>();
    mocks.fetchSnapshot.mockReturnValue(initial.promise);
    mocks.appendEvents.mockReturnValue(response.promise);
    const { result } = renderHook(() => usePlanCollaboration("p1", { initialDays: [day] }));
    act(() => result.current.dispatch(() => update("Early edit")));
    expect(result.current.data[0].activities[0].title).toBe("Early edit");
    expect(mocks.appendEvents).not.toHaveBeenCalled();
    await act(async () =>
      initial.resolve(
        snapshot(1, [{ ...day, activities: [{ ...day.activities[0], description: "Remote note" }] }])
      )
    );
    await waitFor(() => expect(mocks.appendEvents).toHaveBeenCalledTimes(1));
    expect(result.current.data[0].activities[0]).toMatchObject({
      title: "Early edit",
      description: "Remote note",
    });
    await act(async () => response.resolve(stored(mocks.appendEvents.mock.calls[0][0])));
  });

  test("persists every seeded day on the first mutation of an empty plan", async () => {
    const seeds = [
      { ...day, activities: [] },
      { id: "2026-09-11", label: "Day 2", position: "2048", activities: [] },
    ];
    mocks.fetchSnapshot.mockResolvedValue(snapshot(0, []));
    const { result } = renderHook(() => usePlanCollaboration("p1", { initialDays: seeds }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() =>
      result.current.dispatch(() => [
        {
          type: "activity.created",
          payload: {
            dayId: day.id,
            activity: day.activities[0],
            position: "1024",
          },
        },
      ])
    );
    await waitFor(() => expect(result.current.hasPendingChanges).toBe(false));
    const events = mocks.appendEvents.mock.calls[0][0].events;
    expect(events.filter((event) => event.type === "day.created").map((event) => event.payload.day)).toEqual(
      seeds
    );
    expect(events.at(-1)?.type).toBe("activity.created");
    expect(result.current.data.map(({ id, label }) => ({ id, label }))).toEqual(
      seeds.map(({ id, label }) => ({ id, label }))
    );
  });

  test("catches up missed events after realtime subscribes or reconnects", async () => {
    const { result } = await loaded();
    mocks.fetchEvents.mockResolvedValue([remote]);
    act(() => mocks.subscribe.mock.calls.at(-1)?.[3]?.());
    await waitFor(() => expect(result.current.version).toBe(2));
    expect(result.current.data[0].activities[0].description).toBe("Remote note");
  });

  test("catches changes missed when subscription becomes ready during initial loading", async () => {
    const initialEvents = deferred<EventRecord[]>();
    mocks.fetchEvents.mockReturnValueOnce(initialEvents.promise).mockResolvedValue([remote]);
    const { result } = renderHook(() => usePlanCollaboration("p1"));
    await waitFor(() => expect(mocks.fetchEvents).toHaveBeenCalledTimes(1));
    act(() => mocks.subscribe.mock.calls.at(-1)?.[3]?.());
    await act(async () => initialEvents.resolve([]));
    await waitFor(() => expect(result.current.version).toBe(2));
    expect(result.current.data[0].activities[0].description).toBe("Remote note");
  });

  test("does not let an old catch-up response erase newer realtime state", async () => {
    const catchup = deferred<EventRecord[]>();
    const { result } = await loaded();
    mocks.fetchEvents.mockReturnValueOnce(catchup.promise);
    act(() => mocks.subscribe.mock.calls.at(-1)?.[3]?.());
    await waitFor(() => expect(mocks.fetchEvents).toHaveBeenCalledTimes(2));
    emit(remote);
    await act(async () => catchup.resolve([]));
    expect(result.current.version).toBe(2);
    expect(result.current.data[0].activities[0].description).toBe("Remote note");
  });

  test("discards failed pending changes after refreshing the confirmed document", async () => {
    mocks.appendEvents.mockRejectedValueOnce(new Error("Rejected"));
    const { result } = await loaded();
    act(() => result.current.dispatch(() => update("Discard me")));
    await waitFor(() => expect(result.current.error).toBeTruthy());
    mocks.fetchEvents.mockResolvedValue([remote]);
    await act(async () => {
      await result.current.discardPending();
    });
    await waitFor(() => expect(result.current.hasPendingChanges).toBe(false));
    expect(result.current.data[0].activities[0]).toMatchObject({
      title: "Breakfast",
      description: "Remote note",
    });
  });

  test("ignores the previous plan's outstanding append after navigating", async () => {
    const response = deferred<AppendResult>();
    mocks.appendEvents.mockReturnValueOnce(response.promise);
    const { result, rerender } = renderHook(({ planId }) => usePlanCollaboration(planId), {
      initialProps: { planId: "p1" },
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.dispatch(() => update("Old plan edit")));
    await waitFor(() => expect(mocks.appendEvents).toHaveBeenCalledTimes(1));
    const nextDay = { ...day, id: "new-day", label: "New plan", activities: [] };
    mocks.fetchSnapshot.mockResolvedValue(snapshot(4, [nextDay]));
    rerender({ planId: "p2" });
    await waitFor(() => expect(result.current.data[0]?.id).toBe("new-day"));
    await act(async () => response.resolve(stored(mocks.appendEvents.mock.calls[0][0])));
    expect(result.current.data).toEqual([nextDay]);
    expect(result.current.version).toBe(4);
    expect(result.current.hasPendingChanges).toBe(false);
  });
});

it("allows retry after initial loading fails and keeps edits queued in the meantime", async () => {
  mocks.fetchSnapshot.mockRejectedValueOnce(new Error("Offline"));
  const { result } = renderHook(() => usePlanCollaboration("p1", { initialDays: [day] }));
  await waitFor(() => expect(result.current.error).toBeTruthy());
  expect(result.current.isLoading).toBe(false);
  act(() => result.current.dispatch(() => update("Early offline edit")));
  expect(result.current.data[0].activities[0].title).toBe("Early offline edit");
  expect(mocks.appendEvents).not.toHaveBeenCalled();
  await act(async () => result.current.retryPending());
  await waitFor(() => expect(result.current.hasPendingChanges).toBe(false));
  expect(result.current.error).toBeNull();
  expect(result.current.version).toBe(2);
});

it("resumes queued edits automatically when realtime fills a version gap", async () => {
  const { result } = await loaded();
  const later = { ...remote, id: "remote-3", version: 3 };
  emit(later);
  await waitFor(() => expect(result.current.error).toBeTruthy());
  act(() => result.current.dispatch(() => update("Queued during gap")));
  expect(mocks.appendEvents).not.toHaveBeenCalled();

  emit(remote);
  await waitFor(() => expect(result.current.hasPendingChanges).toBe(false));
  expect(result.current.error).toBeNull();
  expect(mocks.appendEvents).toHaveBeenCalledTimes(1);
  expect(mocks.appendEvents.mock.calls[0][0].baseVersion).toBe(3);
  expect(result.current.data[0].activities[0]).toMatchObject({
    title: "Queued during gap",
    description: "Remote note",
  });
});

it("does not clear an append failure when an unrelated realtime gap resolves", async () => {
  const failure = new Error("Append response lost");
  mocks.appendEvents.mockRejectedValueOnce(failure);
  const { result } = await loaded();
  act(() => result.current.dispatch(() => update("Uncertain write")));
  await waitFor(() => expect(result.current.error).toBe(failure));

  emit({ ...remote, id: "remote-3", version: 3 });
  await waitFor(() => expect(mocks.fetchEvents).toHaveBeenCalledTimes(2));
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  emit(remote);

  expect(result.current.version).toBe(3);
  expect(result.current.error).toBe(failure);
  expect(result.current.hasPendingChanges).toBe(true);
  expect(mocks.appendEvents).toHaveBeenCalledTimes(1);
});

it("rejects edits while disabled and ignores empty intents", async () => {
  const { result, rerender } = renderHook(({ enabled }) => usePlanCollaboration("p1", { enabled }), {
    initialProps: { enabled: false },
  });
  expect(result.current.dispatch(() => update("Ignored"))).toBe(false);
  expect(mocks.subscribe).not.toHaveBeenCalled();
  expect(mocks.fetchSnapshot).not.toHaveBeenCalled();
  rerender({ enabled: true });
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.dispatch(() => [])).toBe(false);
  expect(mocks.appendEvents).not.toHaveBeenCalled();
  expect(result.current.hasPendingChanges).toBe(false);
});

it("ignores other plans and unsubscribes on unmount", async () => {
  const { result, unmount } = await loaded();
  emit({ ...remote, planId: "another-plan" });
  expect(result.current.version).toBe(1);
  expect(result.current.data[0].activities[0].description).toBeUndefined();
  const channel = mocks.subscribe.mock.results[0].value;
  unmount();
  expect(channel.unsubscribe).toHaveBeenCalledOnce();
  expect(result.current.dispatch(() => update("After unmount"))).toBe(false);
  expect(mocks.appendEvents).not.toHaveBeenCalled();
});

it("stops retrying an unconfirmed response that makes no progress", async () => {
  mocks.appendEvents.mockResolvedValue({ version: 1, events: [] });
  const { result } = await loaded();
  act(() => result.current.dispatch(() => update("Keep unsaved")));
  await waitFor(() => expect(result.current.error).toEqual(expect.any(Error)));
  expect(result.current.data[0].activities[0].title).toBe("Keep unsaved");
  expect(result.current.hasPendingChanges).toBe(true);
  expect(mocks.appendEvents).toHaveBeenCalledTimes(1);
});

it("keeps queued edits when fetched history contains a missing version", async () => {
  mocks.fetchEvents.mockResolvedValue([{ ...remote, version: 3 }]);
  const { result } = renderHook(() => usePlanCollaboration("p1", { initialDays: [day] }));
  act(() => result.current.dispatch(() => update("Keep draft")));
  await waitFor(() =>
    expect(result.current.error).toEqual(
      expect.objectContaining({
        message: "Unable to synchronize planner: planId=p1, missing version=2",
      })
    )
  );
  expect(result.current.data[0].activities[0].title).toBe("Keep draft");
  expect(mocks.appendEvents).not.toHaveBeenCalled();
  mocks.fetchEvents.mockResolvedValue([remote]);
  await act(async () => result.current.retryPending());
  expect(result.current.hasPendingChanges).toBe(false);
  expect(result.current.error).toBeNull();
});
