import type { SupabaseClient } from "@supabase/supabase-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { supabase } from "@/supabase/client";
import { subscribeToEvents } from "./eventsRealtimeClient";

function realtimeClient() {
  let receive!: (payload: { new: unknown }) => void;
  let status!: (value: string) => void;
  const channel = {
    on: vi.fn((_event: string, _filter: unknown, callback: typeof receive) => {
      receive = callback;
      return channel;
    }),
    subscribe: vi.fn((callback: typeof status) => {
      status = callback;
      return channel;
    }),
    unsubscribe: vi.fn(),
  };
  // Only the channel methods used by this adapter belong to this transport double.
  const client = { channel: vi.fn(() => channel) };
  return {
    client: client as unknown as SupabaseClient,
    channel,
    receive: (row: unknown) => receive({ new: row }),
    status: (value: string) => status(value),
  };
}

afterEach(() => vi.restoreAllMocks());

describe("subscribeToEvents", () => {
  it("subscribes to one plan and maps database rows to domain events", () => {
    const transport = realtimeClient();
    const handler = vi.fn();
    expect(subscribeToEvents("p1", handler, transport.client)).toBe(transport.channel);
    expect(transport.client.channel).toHaveBeenCalledWith("plan-events-p1");
    expect(transport.channel.on).toHaveBeenCalledWith(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "plan_events", filter: "plan_id=eq.p1" },
      expect.any(Function)
    );
    transport.receive({
      event_id: "e1",
      plan_id: "p1",
      version: 2,
      event_type: "activity.deleted",
      payload: { activityId: "a1" },
      created_at: "2026-09-10T00:00:00Z",
      actor_id: "u1",
    });
    expect(handler).toHaveBeenCalledExactlyOnceWith({
      id: "e1",
      planId: "p1",
      version: 2,
      type: "activity.deleted",
      payload: { activityId: "a1" },
      createdAt: "2026-09-10T00:00:00Z",
      actorId: "u1",
    });
  });

  it("rejects malformed rows without delivering them to the document", () => {
    const transport = realtimeClient();
    const handler = vi.fn();
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    subscribeToEvents("p1", handler, transport.client);
    transport.receive({ event_type: "unknown", version: -1 });
    expect(handler).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith("Failed to parse event payload:", expect.any(Error));
  });

  it("requests catch-up on subscription and reconnection only", () => {
    const transport = realtimeClient();
    const ready = vi.fn();
    subscribeToEvents("p1", vi.fn(), transport.client, ready);
    transport.status("SUBSCRIBED");
    transport.status("CHANNEL_ERROR");
    transport.status("TIMED_OUT");
    transport.status("CLOSED");
    expect(ready).toHaveBeenCalledTimes(1);
    transport.status("SUBSCRIBED");
    expect(ready).toHaveBeenCalledTimes(2);
  });

  it("uses the application client without requiring a ready callback", () => {
    const transport = realtimeClient();
    vi.spyOn(supabase, "channel").mockImplementation(transport.client.channel);
    subscribeToEvents("p1", vi.fn());
    expect(supabase.channel).toHaveBeenCalledWith("plan-events-p1");
    expect(() => transport.status("SUBSCRIBED")).not.toThrow();
  });
});
