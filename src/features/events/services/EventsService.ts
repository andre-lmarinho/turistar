import "server-only";

import { buildSnapshotStateForAppend, needsHistoryRebuild } from "@/features/events/lib/snapshotStateBuilder";
import type { SnapshotsService } from "@/features/snapshots/services/SnapshotsService";
import { ApplicationError } from "@/lib/errors/ApplicationError";

import type { EventsRepository } from "../repositories/EventsRepository";
import type { EventInsert, EventRecord } from "../types";
import { AppendEventsResponseSchema, EventInsertSchema, mapEvent, StoredEventSchema } from "./eventsSchemas";

export class EventsService {
  constructor(
    private readonly repo: EventsRepository,
    private readonly snapshots: SnapshotsService
  ) {}

  async fetchEvents(planId: string, sinceVersion: number): Promise<EventRecord[]> {
    const rows = await this.repo.fetchEvents(planId, sinceVersion);
    return rows.map((row) => mapEvent(StoredEventSchema.parse(row)));
  }

  async appendEvents(
    planId: string,
    baseVersion: number,
    events: EventInsert[]
  ): Promise<{ events: EventRecord[]; version: number }> {
    if (!Number.isInteger(baseVersion) || baseVersion < 0) {
      throw new ApplicationError("BAD_REQUEST", "Base version must be a non-negative integer.");
    }

    if (events.length === 0) {
      return { version: baseVersion, events: [] };
    }

    const parsedEvents = EventInsertSchema.array().safeParse(events);
    if (!parsedEvents.success) {
      throw new ApplicationError(
        "BAD_REQUEST",
        `appendEvents failed for planId=${planId}: invalid event payload.`,
        { cause: parsedEvents.error }
      );
    }
    events = parsedEvents.data;

    const snapshot = await this.snapshots.fetchSnapshot(planId);
    const history = needsHistoryRebuild(snapshot) ? await this.fetchEvents(planId, 0) : undefined;
    const preparation = buildSnapshotStateForAppend({
      snapshot,
      baseVersion,
      events,
      history,
    });

    if (preparation.kind === "invalid-history") {
      throw new ApplicationError(
        "CONFLICT",
        `appendEvents failed for planId=${planId}: ${preparation.reason}.`,
        {
          cause: { planId, baseVersion },
        }
      );
    }
    if (preparation.kind === "empty") {
      return { version: baseVersion, events: [] };
    }

    const snapshotState = preparation.kind === "ready" ? preparation.snapshot : undefined;
    const data = await this.repo.appendEvents(planId, baseVersion, events, {
      snapshotState,
    });

    if (!data) {
      return { version: baseVersion, events: [] };
    }

    const { version, inserted_events } = AppendEventsResponseSchema.parse(data);
    return {
      version,
      events: inserted_events.map(mapEvent),
    };
  }
}
