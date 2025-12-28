'use client';

import type { PlanEvent, PlanEventInsert, PlanSnapshot } from '@/features/app/planner/domain/types/PlanEvent';

type SnapshotResponse = { snapshot?: PlanSnapshot | null };
type EventsResponse = { events?: PlanEvent[] | null };
type AppendResponse = { version?: number | null; events?: PlanEvent[] | null };

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

export async function fetchPlanSnapshot(planId: string): Promise<PlanSnapshot> {
  const data = await fetchJson<SnapshotResponse>(
    `/api/plans/events/snapshot?planId=${encodeURIComponent(planId)}`,
    { method: 'GET', credentials: 'same-origin' }
  );

  if (!data.snapshot) {
    throw new Error(`Missing snapshot response: planId=${planId}`);
  }

  return data.snapshot;
}

export async function fetchPlanEvents(planId: string, sinceVersion: number): Promise<PlanEvent[]> {
  const params = new URLSearchParams({
    planId,
    sinceVersion: String(sinceVersion),
  });
  const data = await fetchJson<EventsResponse>(`/api/plans/events?${params.toString()}`, {
    method: 'GET',
    credentials: 'same-origin',
  });

  return data.events ?? [];
}

export async function appendPlanEvents(
  planId: string,
  baseVersion: number,
  events: PlanEventInsert[]
): Promise<{ version: number; events: PlanEvent[] }> {
  const data = await fetchJson<AppendResponse>('/api/plans/events/append', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId, baseVersion, events }),
  });

  if (typeof data.version !== 'number') {
    throw new Error(`Invalid append response: planId=${planId} baseVersion=${baseVersion}`);
  }

  return { version: data.version, events: data.events ?? [] };
}
