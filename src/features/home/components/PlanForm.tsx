'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { DateRange } from 'react-day-picker';
import Image from 'next/image';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { DateRangePicker } from '@/shared/ui/calendar';
import { LocationSearchInput } from '@/shared/ui/input';
import { useDestinationAutocomplete } from '@/features/home/hooks/search/useDestinationAutocomplete';
import LoadingScreen from '@/shared/components/LoadingScreen';
import { useRouter } from 'next/navigation';
import { addDays } from 'date-fns';
import { createPlannerPlan } from '@/features/planner/contracts/marketing/createPlannerPlan';
import { usePlanEditTokens } from '@/features/planner/contracts/marketing/usePlanEditTokens';
import { useRecentPlan } from '@/features/planner/contracts/marketing/useRecentPlan';
import { cn } from '@/shared/utils/cn';
import type { AutocompletePlace } from '@/shared/types/locations';

interface PlanFormProps {
  trigger: ReactNode;
  dialogTitleId: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  contentClassName?: string;
}

export default function PlanForm({
  trigger,
  dialogTitleId,
  open,
  defaultOpen,
  onOpenChange,
  contentClassName,
}: PlanFormProps) {
  const router = useRouter();
  const isControlled = typeof open === 'boolean';
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
  const dialogOpen = isControlled ? open : internalOpen;
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

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const handleClose = () => handleOpenChange(false);

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
    <Dialog open={dialogOpen} onClose={handleClose} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent
        size="sm"
        className={cn('w-full max-w-md p-6', contentClassName)}
        aria-labelledby={dialogTitleId}
        aria-describedby={undefined}
      >
        <DialogHeader className="sr-only">
          <DialogTitle id={dialogTitleId}>Start planning your trip</DialogTitle>
        </DialogHeader>

        <div className="flex w-full justify-end">
          <DialogClose asChild>
            <Button
              type="button"
              variant="icon"
              size="icon"
              title="Close"
              icon="x"
              onClick={handleClose}
            />
          </DialogClose>
        </div>

        {loading ? (
          <LoadingScreen text="Creating plan…" />
        ) : (
          <div className="grid gap-6">
            <h2 className="text-center text-3xl font-semibold tracking-tight">Turistar App</h2>
            <form onSubmit={handleSubmit} noValidate className="flex w-full flex-col items-center">
              <fieldset className="flex w-full justify-center pb-4" aria-labelledby="dest-label">
                <legend id="dest-label" className="sr-only">
                  Destination
                </legend>
                <LocationSearchInput
                  id="dest-input"
                  value={dest}
                  onChange={handleDestChange}
                  placeholder="Destination"
                  className="w-64"
                  autocompleteHook={useDestinationAutocomplete}
                />
              </fieldset>

              <fieldset className="flex w-full justify-center pb-4" aria-labelledby="daterange-label">
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

              <Button className="flex w-full" type="submit">
                Start Your Planning
              </Button>

              {error ? (
                <p id="date-error" role="alert" className="mt-2 text-sm text-[var(--destructive)]">
                  {error}
                </p>
              ) : null}
            </form>
          </div>
        )}

        <div className="pointer-events-none hidden w-full sm:block" aria-hidden="true">
          <Image
            src="/images/mascot_1_.webp"
            alt=""
            aria-hidden="true"
            width={744}
            height={923}
            className="pointer-events-none fixed right-12 bottom-0 h-auto w-[min(280px,20vw)] select-none"
            priority
          />
          <Image
            src="/images/background_1_.webp"
            alt=""
            aria-hidden="true"
            width={828}
            height={466}
            className="pointer-events-none fixed bottom-0 left-4 h-auto w-[min(380px,25vw)] select-none"
            priority
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
