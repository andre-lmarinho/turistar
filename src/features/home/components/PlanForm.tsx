// src/features/home/components/PlanForm.tsx
'use client';

import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import Image from 'next/image';

import { Button, DateRangePicker } from '@/shared/ui';
import { DestinationInput } from '@/features/home';
import LoadingScreen from '@/shared/components/LoadingScreen';
import { useRouter } from 'next/navigation';
import { addDays } from 'date-fns';
import { createPlan } from '@/app/planner/actions/createPlan';
import { saveEditToken } from '@/shared/lib/planEditToken';

export default function PlanForm() {
  const router = useRouter();
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });
  const [dest, setDest] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [title, setTitle] = useState('');

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

  function handleDestChange(val: string | { name: string; latitude: number; longitude: number }) {
    if (typeof val === 'string') {
      setDest(val);
      setCoords(null);
      setTitle(val.split(',')[0].trim());
    } else {
      setDest(val.name);
      setCoords({ lat: val.latitude, lng: val.longitude });
      setTitle(val.name.split(',')[0].trim());
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
      const {
        id: planId,
        publicSlug,
        editToken,
      } = await createPlan(
        title || destParam,
        { name: destParam, latitude: coords?.lat, longitude: coords?.lng },
        range.from.toISOString(),
        range.to.toISOString()
      );

      saveEditToken(planId, editToken);

      const query = new URLSearchParams({
        dest: destParam,
        start: range.from.toISOString(),
        end: range.to.toISOString(),
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

  if (loading) {
    return <LoadingScreen text="Creating plan…" />;
  }

  return (
    <>
      <div>
        <h2 className="pb-4 text-center text-4xl leading-[1.1] font-semibold tracking-tight">
          Turistar App
        </h2>
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex w-full max-w-md flex-col items-center"
        >
          <fieldset className="flex w-full justify-center pb-4" aria-labelledby="dest-label">
            <legend id="dest-label" className="sr-only">
              Destination
            </legend>
            <DestinationInput value={dest} onChange={handleDestChange} />
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

          {error && (
            <p id="date-error" role="alert" className="mt-2 text-sm text-[var(--destructive)]">
              {error}
            </p>
          )}
        </form>
      </div>
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
    </>
  );
}
