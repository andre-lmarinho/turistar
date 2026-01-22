"use client";

import type { EventInsert, EventRecord } from "@/features/events/types";

type EventsResponse = { events?: EventRecord[] | null };
type AppendResponse = { version?: number | null; events?: EventRecord[] | null };

function getRequestMetadata(input: RequestInfo, init?: RequestInit): { method: string; url: string } {
  const method = init?.method ?? (input instanceof Request ? input.method : "GET");
  const url = typeof input === "string" ? input : input instanceof Request ? input.url : String(input);

  return { method, url };
}

async function fetchJson<T>(input: RequestInfo, init?: RequestInit, context?: string): Promise<T> {
  const response = await fetch(input, init);
  if (!response.ok) {
    const { method, url } = getRequestMetadata(input, init);
    const contextText = context ? `${context} ` : "";
    throw new Error(`fetchJson failed: ${contextText}method=${method} url=${url} status=${response.status}`);
  }
  return (await response.json()) as T;
}

export async function fetchEvents(planId: string, sinceVersion: number): Promise<EventRecord[]> {
  const params = new URLSearchParams({
    planId,
    sinceVersion: String(sinceVersion),
  });
  const data = await fetchJson<EventsResponse>(
    `/api/plans/events?${params.toString()}`,
    {
      method: "GET",
      credentials: "same-origin",
    },
    `operation=fetchEvents planId=${planId} sinceVersion=${sinceVersion}`
  );

  return data.events ?? [];
}

export async function appendEvents(
  planId: string,
  baseVersion: number,
  events: EventInsert[]
): Promise<{ version: number; events: EventRecord[] }> {
  const data = await fetchJson<AppendResponse>(
    "/api/plans/events/append",
    {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, baseVersion, events }),
    },
    `operation=appendEvents planId=${planId} baseVersion=${baseVersion}`
  );

  if (typeof data.version !== "number") {
    throw new Error(`Invalid append response: planId=${planId} baseVersion=${baseVersion}`);
  }

  return { version: data.version, events: data.events ?? [] };
}
