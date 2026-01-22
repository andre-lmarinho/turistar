import type { ActivityFormValues } from "../types";

export interface ValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof ActivityFormValues, string>>;
}

/**
 * Validate form values for activity editing.
 */
export function validateForm(values: ActivityFormValues): ValidationResult {
  const errors: ValidationResult["errors"] = {};

  if (!values.title.trim()) {
    errors.title = "Title is required";
  }

  if (values.duration < 0) {
    errors.duration = "Duration cannot be negative";
  }

  if (values.budget < 0) {
    errors.budget = "Budget cannot be negative";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Check if a title is valid.
 */
export function isValidTitle(title: string): boolean {
  return title.trim().length > 0;
}
