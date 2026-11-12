import { z } from "zod";

export const addMemberSchema = z.object({
  planId: z.string().trim().min(1),
  email: z.string().trim().email(),
  tier: z.enum(["admin", "member"]),
});

export type AddMemberInput = z.infer<typeof addMemberSchema>;
