'use client';

import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { addDays } from 'date-fns';
import { useRouter } from 'next/navigation';

import { DateRangePicker } from '@/shared/ui/calendar';
import { LoadingScreen } from '@/shared/ui/loading/LoadingScreen';
import { LocationSearchInput } from '@/features/planner/ui/input/LocationSearchInput';

import { useDestinationAutocomplete } from '@/features/planner/hooks/search/useDestinationAutocomplete';
import { useRecentPlan } from '@/features/planner/hooks/data/useRecentPlan';

import { createPlannerPlan } from '@/features/planner/server/createPlan';
import { usePlanEditTokens } from '@/features/planner/infrastructure/supabase/planEditToken';
import type { AutocompletePlace } from '@/features/planner/types/locations';

interface SignupFormProps {
  title?: string;
  description?: string;
}

export function SignupForm({}: SignupFormProps) {
  const router = useRouter();
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });
  const [dest, setDest] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const { saveEditToken } = usePlanEditTokens();
  const { saveRecentPlan } = useRecentPlan();

  // Declare error state
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  function handleRangeChange(r: DateRange | undefined) {
    setRange(r);
    // Clear any prior errors once a full range is chosen
    if (r?.from && r?.to) {
      setError('');
    }
  }

  function handleDestChange(val: string | AutocompletePlace) {
    if (typeof val === 'string') {
      setDest(val);
      setCoords(null);
    } else {
      setDest(val.name);
      setCoords({ lat: val.latitude, lng: val.longitude });
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Block submission if dates are missing
    if (!range?.from || !range?.to) {
      setError('Please select your travel dates.');
      return;
    }

    setError('');
    const destParam = dest.trim().split(',')[0];
    if (!destParam) {
      setError('Please choose a destination.');
      return;
    }

    setLoading(true);
    try {
      const { planId, publicSlug, editToken, recentPlan } = await createPlannerPlan({
        title: destParam,
        destination: { name: destParam, latitude: coords?.lat, longitude: coords?.lng },
        startDate: range.from.toISOString(),
        endDate: range.to.toISOString(),
      });

      saveEditToken(planId, editToken);
      saveRecentPlan(recentPlan);

      const query = new URLSearchParams({
        dest: recentPlan.dest,
        start: recentPlan.start,
        end: recentPlan.end,
      });
      if (coords) {
        query.set('lat', String(coords.lat));
        query.set('lng', String(coords.lng));
      }
      const queryString = query.toString();
      router.push(`/planner/${publicSlug}?${queryString}`);
    } catch {
      setError('Failed to create plan.');
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? <LoadingScreen text="Creating plan…" /> : null}

      <div className="mt-12">
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
              aria-describedby={error ? 'date-error' : undefined}
              aria-invalid={Boolean(error)}
            />
          </fieldset>

          <button
            className="bg-primary text-primary-foreground hover:bg-primary/90 mx-auto w-full rounded-md px-4 py-2 text-sm font-medium transition-colors"
            type="submit"
            disabled={loading}
          >
            Start Your Planning
          </button>

          {error ? (
            <p id="date-error" role="alert" className="text-sm text-[var(--destructive)]">
              {error}
            </p>
          ) : null}
        </form>
      </div>
    </>
  );
}
