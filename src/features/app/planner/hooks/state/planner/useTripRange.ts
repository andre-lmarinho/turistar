'use client';

import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { eachDayOfInterval, parseISO } from 'date-fns';
import { DateRange } from 'react-day-picker';
import type { DayPlan } from '@/features/app/planner/domain/types/PlannerEntities';

/**
 * Manages the trip date range in client state.
 * - Initializes from URL search params if present, otherwise from provided days.
 * - Exposes the computed days within the range and a setter for the picker.
 */

export function useTripRange(initialDays: DayPlan[] = []) {
  const params = useSearchParams();
  const startIso = params.get('start');
  const endIso = params.get('end');

  const [currentRange, setCurrentRange] = useState<DateRange | undefined>(() => {
    if (startIso && endIso) {
      return { from: parseISO(startIso), to: parseISO(endIso) };
    }
    if (initialDays.length) {
      const dates = initialDays.map((d) => parseISO(d.id));
      return { from: dates[0], to: dates[dates.length - 1] };
    }
    return undefined;
  });

  useEffect(() => {
    if (!startIso && !endIso && initialDays.length && !currentRange) {
      const dates = initialDays.map((d) => parseISO(d.id));
      setCurrentRange({ from: dates[0], to: dates[dates.length - 1] });
    }
  }, [startIso, endIso, initialDays, currentRange]);

  const tripDays = useMemo(() => {
    if (!currentRange?.from || !currentRange?.to) return [];
    return eachDayOfInterval({ start: currentRange.from, end: currentRange.to });
  }, [currentRange]);

  function handleRangeChange(r: DateRange | undefined) {
    setCurrentRange(r);
  }

  return { tripDays, currentRange, handleRangeChange };
}
