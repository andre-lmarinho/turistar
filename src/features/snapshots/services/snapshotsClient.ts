"use client";

import type { Snapshot } from "@/features/snapshots/types";

type SnapshotResponse = { snapshot?: Snapshot | null };

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

export async function fetchSnapshot(planId: string): Promise<Snapshot> {
  const data = await fetchJson<SnapshotResponse>(
    `/api/plans/events/snapshot?planId=${encodeURIComponent(planId)}`,
    { method: "GET", credentials: "same-origin" },
    `operation=fetchSnapshot planId=${planId}`
  );

  if (!data.snapshot) {
    throw new Error(`Missing snapshot response: planId=${planId}`);
  }

  return data.snapshot;
}
