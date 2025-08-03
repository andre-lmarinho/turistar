// src/components/home/WelcomeForm.tsx
'use client';

import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import Image from 'next/image';

import { Button, DateRangePicker, DestinationInput, LoadingScreen } from '@/components';
import { useRouter } from 'next/navigation';
import { addDays } from 'date-fns';
import { fetchCatalog } from '@/hooks';
import { createPlan } from '@/app/planner/actions/createPlan';

export default function WelcomeForm() {
  const router = useRouter();
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });
  const [dest, setDest] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

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
      const { id: planId } = await createPlan(
        destParam,
        range.from.toISOString(),
        range.to.toISOString()
      );
      try {
        const { activities } = await fetchCatalog(destParam);
        localStorage.setItem(`catalog-${planId}`, JSON.stringify(activities));
      } catch (err) {
        console.error(err);
      }
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
      router.push(`/planner/${planId}?${queryString}`);
    } catch {
      setError('Failed to create plan.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen text="Loading catalog..." />;
  }

  return (
    <section className="hero relative overflow-hidden p-8 pt-[184px] sm:pt-[92px] md:h-auto md:pt-24 lg:pt-28">
      <div className="relative container flex flex-col pt-20">
        <div className="relative z-10 flex flex-col-reverse items-center gap-10 lg:flex-row lg:items-start">
          <div className="flex w-full items-start gap-4 sm:gap-6 md:gap-8 lg:gap-10">
            {/* Text */}
            <div className="flex-1 pb-[5dvh] lg:pb-[15dvh]">
              <h1 className="font-title text-foreground pb-6 text-[32px] leading-[0.9] font-semibold tracking-tight sm:text-[40px] md:text-[56px] lg:text-[72px] xl:text-[84px]">
                Turistar App
                <br />
                for your trip
              </h1>

              <form onSubmit={handleSubmit} noValidate>
                <fieldset className="flex pb-4" aria-labelledby="dest-label">
                  <legend id="dest-label" className="sr-only">
                    Destination
                  </legend>
                  <DestinationInput value={dest} onChange={handleDestChange} />
                </fieldset>
                <fieldset className="flex pb-4" aria-labelledby="daterange-label">
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

                <Button type="submit">Start Your Planning</Button>

                {error && (
                  <p
                    id="date-error"
                    role="alert"
                    className="mt-2 text-sm text-[var(--destructive)]"
                  >
                    {error}
                  </p>
                )}
              </form>
            </div>
          </div>
          {/* Mascot */}
          <div className="absolute right-[10%] bottom-0 w-[40%] max-w-[280px] min-w-[100px] lg:right-[20%] lg:w-[36%] lg:max-w-[420px]">
            <Image
              src="/images/mascot_1_.webp"
              alt=""
              role="presentation"
              width={800}
              height={600}
              className="h-auto w-full -scale-x-100 transform"
            />
          </div>
        </div>

        {/* App Preview */}
        <div className="relative z-10 w-[90%] overflow-hidden rounded-t-md lg:left-0 lg:w-[78.4%]">
          {/* Imagem */}
          <Image
            src="/previews/preview_01.png"
            alt="Screenshot of the planner interface"
            width={1600}
            height={900}
            className="w-full rounded-t-lg shadow-xl"
          />

          <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-40">
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to bottom, transparent 0%, var(--background) 70%)',
                height: '100%',
              }}
            />
            <div
              className="absolute right-0 bottom-0 left-0 h-5"
              style={{
                backgroundColor: 'var(--background)',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
