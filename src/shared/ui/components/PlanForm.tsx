'use client';

import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import Image from 'next/image';
import { addDays } from 'date-fns';
import { useRouter } from 'next/navigation';

import { DateRangePicker } from '@/shared/ui/calendar';
import { LocationSearchInput } from '@/shared/ui/input';
import { useDestinationAutocomplete } from '@/shared/hooks/search/useDestinationAutocomplete';
import LoadingScreen from '@/shared/components/LoadingScreen';
import { createPlannerPlan } from '@/features/planner/contracts/marketing/createPlannerPlan';
import { usePlanEditTokens } from '@/features/planner/contracts/marketing/usePlanEditTokens';
import { useRecentPlan } from '@/features/planner/contracts/marketing/useRecentPlan';
import { cn } from '@/shared/utils/cn';
import type { AutocompletePlace } from '@/shared/types/locations';

interface PlanFormProps {
  className?: string;
  title?: string;
  description?: string;
}

export default function PlanForm({ className, title, description }: PlanFormProps) {
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
    <section
      className={cn(
        'bg-card relative mx-auto w-full max-w-2xl rounded-3xl border px-6 py-8 shadow-sm sm:px-10 sm:py-12',
        className
      )}
    >
      {loading ? <LoadingScreen text="Creating plan…" /> : null}
      <div className="grid gap-6 text-center">
        <div className="grid gap-3">
          <h2 className="text-3xl font-semibold tracking-tight">{title ?? 'Turistar App'}</h2>
          {description ? (
            <p className="text-muted-foreground text-lg">{description}</p>
          ) : (
            <p className="text-muted-foreground text-lg">
              Create your plan, invite friends, and keep every detail organized in one place.
            </p>
          )}
        </div>
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
              className="mx-auto w-full max-w-sm"
              autocompleteHook={useDestinationAutocomplete}
            />
          </fieldset>

          <fieldset className="grid gap-2" aria-labelledby="daterange-label">
            <legend id="daterange-label" className="sr-only">
              Travel dates
            </legend>
            <div className="mx-auto w-full max-w-md">
              <DateRangePicker
                value={range}
                onChange={handleRangeChange}
                aria-describedby={error ? 'date-error' : undefined}
                aria-invalid={Boolean(error)}
              />
            </div>
          </fieldset>

          <button
            className="bg-primary text-primary-foreground hover:bg-primary/90 mx-auto w-full max-w-sm rounded-md px-4 py-2 text-sm font-medium transition-colors"
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

      <div className="pointer-events-none fixed inset-x-0 bottom-0 hidden justify-between sm:flex">
        <Image
          src="/images/background_1_.webp"
          alt=""
          aria-hidden="true"
          width={828}
          height={466}
          className="pointer-events-none h-auto w-[min(280px,20vw)] select-none"
          priority
        />
        <Image
          src="/images/mascot_1_.webp"
          alt=""
          aria-hidden="true"
          width={744}
          height={923}
          className="pointer-events-none h-auto w-[min(260px,18vw)] select-none"
          priority
        />
      </div>
    </section>
  );
}
