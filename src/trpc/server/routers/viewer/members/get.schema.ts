import { z } from "zod";

export const getMembersSchema = z.object({
  planId: z.string().trim().min(1),
});

export type GetMembersInput = z.infer<typeof getMembersSchema>;
