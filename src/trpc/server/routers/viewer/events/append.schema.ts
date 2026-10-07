import { z } from "zod";

import { EventInsertSchema } from "@/features/events/services/eventsSchemas";

export const appendEventsSchema = z.object({
  planId: z.string().trim().min(1),
  baseVersion: z.number().int().nonnegative(),
  events: z.array(EventInsertSchema),
});

export type AppendEventsInput = z.infer<typeof appendEventsSchema>;
