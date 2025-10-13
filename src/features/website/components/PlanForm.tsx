'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DateRange } from 'react-day-picker';
import Image from 'next/image';
import { addDays } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Plane, Kanban, LandPlot } from '@/shared/ui/icon';

import { DateRangePicker } from '@/shared/ui/calendar';
import { LocationSearchInput } from '@/shared/ui/input';
import { useDestinationAutocomplete } from '@/shared/hooks/search/useDestinationAutocomplete';
import { LoadingScreen } from '@/shared/ui/loading/LoadingScreen';
import { createPlannerPlan } from '@/features/planner/contracts/marketing/createPlannerPlan';
import { usePlanEditTokens } from '@/features/planner/contracts/marketing/usePlanEditTokens';
import { useRecentPlan } from '@/features/planner/contracts/marketing/useRecentPlan';
import type { AutocompletePlace } from '@/shared/types/locations';

interface PlanFormProps {
  title?: string;
  description?: string;
}

export function PlanForm({}: PlanFormProps) {
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
    <div className="bg-card flex min-h-screen w-full flex-col items-center justify-center">
      {loading ? <LoadingScreen text="Creating plan…" /> : null}
      <div className="2xl:border-border bg-background grid w-full max-w-[1440px] grid-cols-1 grid-rows-1 overflow-hidden lg:grid-cols-2 2xl:rounded-[20px] 2xl:border 2xl:py-6">
        {/* Left */}
        <div className="mt-0 mr-auto ml-auto flex w-full max-w-xl flex-col px-4 pt-6 sm:px-16 md:px-20 lg:mt-24 2xl:px-28">
          {/* Heading */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">Start your planning</h1>
            <p className="text-muted-foreground text-base font-medium">
              Create your free plan, invite friends, and keep every detail organized in one place.
            </p>
          </div>
          {/* Form */}
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
          {/* Footer */}
          <div className="text-muted-foreground mt-10 flex h-full flex-col justify-end pb-6 text-sm">
            <p>
              {'Already have an account? '}
              <Link href="/login" className="text-foreground hover:underline">
                LogIn
              </Link>
            </p>
            <p>
              {'By continuing, you agree to our '}
              <Link href="/terms" className="text-foreground hover:underline">
                Terms
              </Link>
              {' and '}
              <Link href="/privacy" className="text-foreground hover:underline">
                Privacy Policy
              </Link>
              {'.'}
            </p>
          </div>
        </div>
        {/* Rigth */}
        <div className="border-border lg:bg-muted/30 mx-auto mt-24 w-full max-w-2xl flex-col justify-between rounded-l-2xl pl-4 lg:mt-0 lg:flex lg:max-w-full lg:border lg:py-12 lg:pl-12">
          {/* Image */}
          <div className="border-default bg-muted/30 hidden rounded-tl-2xl rounded-br-none rounded-bl-2xl border border-r-0 border-dashed lg:block lg:py-[6px] lg:pl-[6px]">
            <Image
              src="/images/placeholder.png"
              alt=""
              className="bloc min-h-[40dvh]"
              aria-hidden="true"
              width={330}
              height={100}
            />
          </div>
          {/* Features */}
          <div className="mt-8 mr-12 hidden h-full w-full grid-cols-3 gap-4 overflow-hidden lg:grid">
            {/* Feature#01 */}
            <div className="mb-8 flex max-w-52 flex-col leading-none sm:mb-0">
              <div className="items-center">
                <Plane className="size-4" aria-hidden="true" />
                <span className="text-sm font-medium">Build your full itinerary</span>
              </div>
              <div className="text-muted-foreground text-sm">
                <p>
                  Create and organize travel days with activities, schedules, and personal notes.
                </p>
              </div>
            </div>
            {/* Feature#02 */}
            <div className="mb-8 flex max-w-52 flex-col leading-none sm:mb-0">
              <div className="items-center">
                <Kanban className="size-4" aria-hidden="true" />
                <span className="text-sm font-medium">Drag and drop your ideas</span>
              </div>
              <div className="text-muted-foreground text-sm">
                <p>Rearrange days and activities with an intuitive visual interface.</p>
              </div>
            </div>
            {/* Feature#03 */}
            <div className="mb-8 flex max-w-52 flex-col leading-none sm:mb-0">
              <div className="items-center">
                <LandPlot className="size-4" aria-hidden="true" />
                <span className="text-sm font-medium">See everything in one place</span>
              </div>
              <div className="text-muted-foreground text-sm">
                <p>View your plan, budget, and map in a single integrated view.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
