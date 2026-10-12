"use client";

import { addDays } from "date-fns";
import { useTranslations } from "next-intl";

import type { SubmitEvent } from "react";
import { useRef, useState } from "react";
import type { DateRange } from "react-day-picker";
import type { CreatePlannerPlanResult } from "@/features/plan/services/PlanService";
import { LocationSearchInput } from "@/features/search/components/LocationSearchInput";
import { useDestinationAutocomplete } from "@/features/search/hooks/searchHooks";
import type { AutocompletePlace } from "@/features/search/types";
import { trpc } from "@/trpc/react";
import { Button } from "@/ui/components/button/Button";
import { DateRangePicker } from "@/ui/components/calendar/DateRangePicker";
import { Spinner } from "@/ui/components/loading/Spinner";

type PlannerCreationFormProps = {
  onPlanCreated: (plan: CreatePlannerPlanResult) => void;
  onPendingChange?: (pending: boolean) => void;
};

function getDefaultRange(): DateRange {
  return {
    from: new Date(),
    to: addDays(new Date(), 7),
  };
}

export function PlannerCreationForm({ onPlanCreated, onPendingChange }: PlannerCreationFormProps) {
  const t = useTranslations();
  const [range, setRange] = useState<DateRange | undefined>(getDefaultRange());
  const [dest, setDest] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destCountry, setDestCountry] = useState<string | null>(null);
  const [placeId, setPlaceId] = useState<string | null>(null);
  const [error, setError] = useState<{ field: "destination" | "dates" | "submit"; message: string } | null>(
    null
  );
  const destinationRef = useRef<HTMLInputElement>(null);
  const datesRef = useRef<HTMLButtonElement>(null);
  const submitting = useRef(false);
  const createPlan = trpc.viewer.plan.create.useMutation();
  const loading = createPlan.isPending;

  function handleRangeChange(nextRange: DateRange | undefined) {
    setRange(nextRange);
    if (nextRange?.from && nextRange?.to) {
      setError((current) => (current?.field === "dates" ? null : current));
    }
  }

  function handleDestChange(val: string | AutocompletePlace) {
    setError((current) => (current?.field === "destination" ? null : current));
    if (typeof val === "string") {
      setDest(val);
      setCoords(null);
      setDestCountry(null);
      setPlaceId(null);
    } else {
      setDest(val.name);
      setCoords({ lat: val.latitude, lng: val.longitude });
      setDestCountry(val.countryCode ?? val.country ?? null);
      setPlaceId(val.placeId ?? null);
    }
  }

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    if (submitting.current) return;

    setError(null);
    const destParam = dest.trim().split(",")[0];
    if (!destParam) {
      setError({ field: "destination", message: t("chooseDestination") });
      destinationRef.current?.focus();
      return;
    }
    if (!range?.from || !range?.to) {
      setError({ field: "dates", message: t("selectTravelDates") });
      datesRef.current?.focus();
      return;
    }

    submitting.current = true;
    onPendingChange?.(true);
    try {
      const planResult = await createPlan.mutateAsync({
        title: destParam,
        destination: {
          name: destParam,
          latitude: coords?.lat,
          longitude: coords?.lng,
          country: destCountry ?? undefined,
          placeId: placeId ?? undefined,
        },
        startDate: range.from.toISOString(),
        endDate: range.to.toISOString(),
      });

      onPlanCreated(planResult);
      setRange(getDefaultRange());
      setDest("");
      setCoords(null);
      setDestCountry(null);
      setPlaceId(null);
    } catch (err) {
      console.error("Failed to create plan", {
        destination: destParam,
        message: err instanceof Error ? err.message : "Unknown error",
      });
      setError({ field: "submit", message: t("createPlanFailed") });
    } finally {
      submitting.current = false;
      onPendingChange?.(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-4">
      <div className="grid gap-2">
        <label htmlFor="dest-input" className="text-sm font-medium">
          {t("destinationLabel")}
        </label>
        <LocationSearchInput
          id="dest-input"
          inputRef={destinationRef}
          inputProps={{
            name: "destination",
            disabled: loading,
            "aria-invalid": error?.field === "destination",
            "aria-describedby": error?.field === "destination" ? "destination-error" : undefined,
          }}
          value={dest}
          onChange={handleDestChange}
          placeholder={t("destinationLabel")}
          autocompleteHook={useDestinationAutocomplete}
        />
        {error?.field === "destination" ? (
          <p id="destination-error" role="alert" className="text-destructive text-sm">
            {error.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <label id="daterange-label" htmlFor="travel-dates" className="text-sm font-medium">
          {t("travelDatesLabel")}
        </label>

        <DateRangePicker
          id="travel-dates"
          ref={datesRef}
          value={range}
          onChange={handleRangeChange}
          disabled={loading}
          aria-labelledby="daterange-label travel-dates"
          aria-describedby={error?.field === "dates" ? "dates-error" : undefined}
          aria-invalid={error?.field === "dates"}
        />
        {error?.field === "dates" ? (
          <p id="dates-error" role="alert" className="text-destructive text-sm">
            {error.message}
          </p>
        ) : null}
      </div>

      <Button
        data-testid="create-trip-submit"
        type="submit"
        disabled={loading}
        aria-busy={loading}
        className="w-full gap-2">
        {loading ? <Spinner className="size-4" /> : null}
        {t("createTrip")}
      </Button>
      <p role="status" className="sr-only">
        {loading ? t("creatingPlan") : ""}
      </p>

      {error?.field === "submit" ? (
        <p role="alert" className="text-destructive text-sm">
          {error.message}
        </p>
      ) : null}
    </form>
  );
}
