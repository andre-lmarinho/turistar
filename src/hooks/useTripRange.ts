"use client";

import { useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { eachDayOfInterval, parseISO } from "date-fns";
import { DateRange } from "react-day-picker";

export function useTripRange(dest: string) {
  const params = useSearchParams();
  const router = useRouter();

  const startIso = params.get("start");
  const endIso   = params.get("end");

  const tripDays = useMemo(() => {
    if (!startIso || !endIso) return [];
    return eachDayOfInterval({ start: parseISO(startIso), end: parseISO(endIso) });
  }, [startIso, endIso]);

  const currentRange: DateRange | undefined =
    tripDays.length
      ? { from: tripDays[0], to: tripDays[tripDays.length - 1] }
      : undefined;

  function handleRangeChange(r: DateRange | undefined) {
    if (r?.from && r?.to) {
      router.replace(
        `/planner?dest=${dest}&start=${r.from.toISOString()}&end=${r.to.toISOString()}`,
        { scroll: false }
      );
    }
  }

  return { tripDays, currentRange, handleRangeChange };
}
