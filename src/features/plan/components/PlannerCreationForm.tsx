"use client";

import { addDays } from "date-fns";
import type { FormEvent } from "react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

import { usePlanEditTokens } from "@/features/events/hooks/usePlanEditTokens";
import { LocationSearchInput } from "@/features/search/components/LocationSearchInput";
import { useDestinationAutocomplete } from "@/features/search/hooks/useDestinationAutocomplete";
import type { AutocompletePlace } from "@/features/search/types";
import { Button } from "@/shared/ui/button/Button";
import { DateRangePicker } from "@/shared/ui/calendar/DateRangePicker";
import { LoadingScreen } from "@/shared/ui/loading/LoadingScreen";

import type { CreatePlannerPlanResult } from "../lib/createUserPlan";
import { createUserPlan } from "../lib/createUserPlan";

type PlannerCreationFormProps = {
  onPlanCreated: (plan: CreatePlannerPlanResult) => void;
};

function getDefaultRange(): DateRange {
  return {
    from: new Date(),
    to: addDays(new Date(), 7),
  };
}

export function PlannerCreationForm({ onPlanCreated }: PlannerCreationFormProps) {
  const [range, setRange] = useState<DateRange | undefined>(getDefaultRange());
  const [dest, setDest] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destCountry, setDestCountry] = useState<string | null>(null);
  const { saveEditToken } = usePlanEditTokens({ enabled: false });

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  function handleRangeChange(nextRange: DateRange | undefined) {
    setRange(nextRange);
    if (nextRange?.from && nextRange?.to) {
      setError("");
    }
  }

  function handleDestChange(val: string | AutocompletePlace) {
    if (typeof val === "string") {
      setDest(val);
      setCoords(null);
      setDestCountry(null);
    } else {
      setDest(val.name);
      setCoords({ lat: val.latitude, lng: val.longitude });
      setDestCountry(val.countryCode ?? val.country ?? null);
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!range?.from || !range?.to) {
      setError("Please select your travel dates.");
      return;
    }

    setError("");
    const destParam = dest.trim().split(",")[0];
    if (!destParam) {
      setError("Please choose a destination.");
      return;
    }

    setLoading(true);
    try {
      const planResult = await createUserPlan({
        title: destParam,
        destination: {
          name: destParam,
          latitude: coords?.lat,
          longitude: coords?.lng,
          country: destCountry ?? undefined,
        },
        startDate: range.from.toISOString(),
        endDate: range.to.toISOString(),
      });

      const { planId, editToken } = planResult;
      saveEditToken(planId, editToken);

      onPlanCreated(planResult);
      setRange(getDefaultRange());
      setDest("");
      setCoords(null);
      setDestCountry(null);
    } catch (err) {
      console.error(`Failed to create plan: destination=${destParam}`, err);
      setError("Failed to create plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? <LoadingScreen text="Creating plan..." /> : null}
      <form onSubmit={handleSubmit} noValidate className="grid gap-4">
        <fieldset className="grid gap-2" aria-labelledby="dest-label">
          <legend id="dest-label" className="sr-only">
            Destination
          </legend>
          <LocationSearchInput
            id="dest-input"
            value={dest}
            onChange={handleDestChange}
            placeholder="Destination"
            autocompleteHook={useDestinationAutocomplete}
          />
        </fieldset>

        <fieldset className="grid gap-2" aria-labelledby="daterange-label">
          <legend id="daterange-label" className="sr-only">
            Travel dates
          </legend>

          <DateRangePicker
            value={range}
            onChange={handleRangeChange}
            aria-describedby={error ? "date-error" : undefined}
            aria-invalid={Boolean(error)}
          />
        </fieldset>

        <Button type="submit" disabled={loading} className="w-full">
          Start Your Planning
        </Button>

        {error ? (
          <p id="date-error" role="alert" className="text-destructive text-sm">
            {error}
          </p>
        ) : null}
      </form>
    </>
  );
}
