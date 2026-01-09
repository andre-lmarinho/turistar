"use client";

import { addDays } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { LocationSearchInput } from "@/features/app/planner/components/ui/LocationSearchInput";
import { usePlanEditTokens } from "@/features/app/planner/hooks/data/usePlanEditTokens";
import type { AutocompletePlace } from "@/features/app/planner/types/locations";
import { useDestinationAutocomplete } from "@/features/userPlanners/hooks/useDestinationAutocomplete";
import type { CreatePlannerPlanResult } from "@/features/userPlanners/lib/createUserPlan";
import { createUserPlan } from "@/features/userPlanners/lib/createUserPlan";
import type { UserPlannerSummary } from "@/features/userPlanners/lib/getUserPlanners";
import { Button } from "@/shared/ui/button";
import { DateRangePicker } from "@/shared/ui/calendar";
import { Card, CardGrid } from "@/shared/ui/card";
import { LoadingScreen } from "@/shared/ui/loading";
import { Popover, PopoverContent, PopoverHeader, PopoverTriggerButton } from "@/shared/ui/popover";

interface PlannersViewProps {
  plans: UserPlannerSummary[];
}

function getDefaultRange(): DateRange {
  return {
    from: new Date(),
    to: addDays(new Date(), 7),
  };
}

function PlannerCreationForm({ onPlanCreated }: { onPlanCreated: (plan: CreatePlannerPlanResult) => void }) {
  const [range, setRange] = useState<DateRange | undefined>(getDefaultRange());
  const [dest, setDest] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destCountry, setDestCountry] = useState<string | null>(null);
  const { saveEditToken } = usePlanEditTokens({ enabled: false });

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  function handleRangeChange(r: DateRange | undefined) {
    setRange(r);
    if (r?.from && r?.to) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setLoading(false);
    } catch {
      setError("Failed to create plan.");
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

function NewPlannerTile() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handlePlanCreated(plan: CreatePlannerPlanResult) {
    setOpen(false);
    router.push(`/p/${plan.publicSlug ?? plan.planId}`);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTriggerButton className="bg-muted border-border block h-full w-full cursor-pointer rounded-xl border shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex h-40 w-full flex-col items-center justify-center px-4 text-center">
          <p className="truncate text-sm font-semibold">Create new planner</p>
        </div>
      </PopoverTriggerButton>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={8}
        avoidCollisions
        collisionPadding={8}
        className="w-90 p-0">
        <PopoverHeader title="Create Planner" onClose={() => setOpen(false)} />
        <div className="p-4">
          <PlannerCreationForm onPlanCreated={handlePlanCreated} />
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function PlannersView({ plans }: PlannersViewProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xl leading-none">📚</span>
        <h1 className="text-foreground text-base font-semibold tracking-wide uppercase">Your planners</h1>
      </div>

      <CardGrid>
        {plans.map((plan) => (
          <Card
            key={plan.id}
            href={`/p/${plan.publicSlug}`}
            title={plan.title}
            image="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=60"
          />
        ))}
        <NewPlannerTile />
      </CardGrid>
    </section>
  );
}
