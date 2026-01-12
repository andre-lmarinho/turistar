import { z } from "zod";

const inspirationCategorySchema = z.enum([
  "transport",
  "lodging",
  "food",
  "activities",
  "shopping",
  "documents",
]);

export const inspirationActivitySchema = z
  .object({
    title: z.string(),
    startTime: z.string(),
    duration: z.number(),
    address: z.string(),
    budget: z.number().optional(),
    imageUrl: z.string().optional(),
    color: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  })
  .strict();

export const inspirationDaySchema = z
  .object({
    activities: z.array(inspirationActivitySchema),
  })
  .strict();

export const inspirationExpenseSchema = z
  .object({
    description: z.string(),
    category: inspirationCategorySchema,
    amount: z.number(),
  })
  .strict();

export const inspirationBudgetSchema = z
  .object({
    amount: z.number(),
  })
  .strict();

export const inspirationDataSchema = z
  .object({
    destination: z.string(),
    budget: inspirationBudgetSchema.optional(),
    expenses: z.array(inspirationExpenseSchema).optional(),
    itinerary: z.array(inspirationDaySchema),
  })
  .strict();

export const inspirationDocumentSchema = inspirationDataSchema
  .extend({
    title: z.string().optional(),
    description: z.string().optional(),
  })
  .strict();

export type InspirationActivity = z.infer<typeof inspirationActivitySchema>;
export type InspirationDay = z.infer<typeof inspirationDaySchema>;
export type InspirationExpense = z.infer<typeof inspirationExpenseSchema>;
export type InspirationBudget = z.infer<typeof inspirationBudgetSchema>;
export type InspirationData = z.infer<typeof inspirationDataSchema>;
export type InspirationDocument = z.infer<typeof inspirationDocumentSchema>;
