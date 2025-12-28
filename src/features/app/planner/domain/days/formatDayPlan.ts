import { formatISO, format } from 'date-fns';
import type { DayPlan } from '@/features/app/planner/domain/types/PlannerEntities';

/**
 * Formats a single date into a DayPlan structure.
 * - id: ISO string (YYYY-MM-DD) → used as the unique identifier.
 * - label: Human-readable format (e.g. "Mon, 05 Jul").
 *
 * This helper ensures consistent ID and label formatting across the planner.
 */
export function formatDayPlan(date: Date): Pick<DayPlan, 'id' | 'label'> {
  return {
    id: formatISO(date, { representation: 'date' }),
    label: format(date, 'EEE, dd MMM'),
  };
}
