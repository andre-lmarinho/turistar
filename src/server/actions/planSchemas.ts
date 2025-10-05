import { z, ZodError, ZodIssueCode } from 'zod';

const trimmedString = (fieldLabel: string) =>
  z
    .string({
      required_error: `${fieldLabel} is required.`,
      invalid_type_error: `${fieldLabel} must be a string.`,
    })
    .trim()
    .min(1, `${fieldLabel} cannot be empty.`);

const coordinateNumber = (fieldLabel: string) =>
  z
    .number({ invalid_type_error: `${fieldLabel} must be a number.` })
    .refine((value) => Number.isFinite(value), `${fieldLabel} must be a finite number.`);

const coerceDate = (fieldLabel: string) =>
  z.preprocess(
    (value) => {
      if (value === undefined || value === null) return value;
      if (value instanceof Date) return value;
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return undefined;
        return new Date(trimmed);
      }
      if (typeof value === 'number') return new Date(value);
      return value;
    },
    z
      .date({
        required_error: `${fieldLabel} is required.`,
        invalid_type_error: `${fieldLabel} must be a valid date.`,
      })
      .refine((value) => !Number.isNaN(value.getTime()), {
        message: `${fieldLabel} must be a valid date.`,
      })
  );

const withDateOrderValidation = <T extends z.ZodTypeAny>(schema: T) =>
  schema.superRefine((value, ctx) => {
    const { startDate, endDate } = value as { startDate: Date; endDate: Date };
    if (startDate > endDate) {
      ctx.addIssue({
        code: ZodIssueCode.custom,
        message: 'End date must be on or after the start date.',
        path: ['endDate'],
      });
    }
  });

export const planTitleSchema = trimmedString('Plan title');

export const destinationNameSchema = trimmedString('Destination name');

const latitudeSchema = coordinateNumber('Latitude');
const longitudeSchema = coordinateNumber('Longitude');

export const planDestinationSchema = z
  .object({
    name: destinationNameSchema,
    latitude: latitudeSchema.optional(),
    longitude: longitudeSchema.optional(),
  })
  .refine(
    (value) =>
      (value.latitude === undefined && value.longitude === undefined) ||
      (value.latitude !== undefined && value.longitude !== undefined),
    {
      message: 'Both latitude and longitude are required when providing coordinates.',
      path: ['longitude'],
    }
  );

const startDateSchema = coerceDate('Start date');
const endDateSchema = coerceDate('End date');

export const planDateRangeSchema = withDateOrderValidation(
  z.object({
    startDate: startDateSchema,
    endDate: endDateSchema,
  })
);

export const planIdSchema = trimmedString('Plan id');

export const planEditTokenSchema = trimmedString('Edit token');

export const createPlanSchema = withDateOrderValidation(
  z.object({
    title: planTitleSchema,
    destination: planDestinationSchema,
    startDate: startDateSchema,
    endDate: endDateSchema,
  })
);

export const updatePlanTitleSchema = z.object({
  planId: planIdSchema,
  editToken: planEditTokenSchema,
  title: planTitleSchema,
});

export const setPlanDateRangeSchema = withDateOrderValidation(
  z.object({
    planId: planIdSchema,
    startDate: startDateSchema,
    endDate: endDateSchema,
  })
);

export type PlanDestinationInput = z.input<typeof planDestinationSchema>;
export type PlanDestination = z.output<typeof planDestinationSchema>;
export type PlanDateRange = z.output<typeof planDateRangeSchema>;
export type CreatePlanData = z.output<typeof createPlanSchema>;
export type UpdatePlanTitleData = z.output<typeof updatePlanTitleSchema>;
export type SetPlanDateRangeData = z.output<typeof setPlanDateRangeSchema>;

export type PlanDateValue = string | number | Date;

export interface PlanDateRangeInput {
  startDate: PlanDateValue;
  endDate: PlanDateValue;
}

export interface CreatePlanInput extends PlanDateRangeInput {
  title: string;
  destination: PlanDestinationInput;
}

export interface UpdatePlanTitleInput {
  planId: string;
  editToken: string;
  title: string;
}

export interface SetPlanDateRangeInput extends PlanDateRangeInput {
  planId: string;
}

export function getFriendlyZodMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof ZodError) {
    const message = error.issues
      .map((issue) => issue.message)
      .filter(Boolean)
      .join('; ');
    return message || fallbackMessage;
  }
  return fallbackMessage;
}
