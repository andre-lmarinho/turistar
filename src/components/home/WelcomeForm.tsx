// src/components/home/WelcomeForm.tsx
'use client';

import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import Image from 'next/image';

import { Button, DateRangePicker } from '@/components';
import { STARTER_PLANNER_TITLE } from '@/constants';
import { useRouter } from 'next/navigation';
import { addDays } from 'date-fns';

export default function WelcomeForm() {
  const router = useRouter();
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  // Declare error state
  const [error, setError] = useState<string>('');

  function handleRangeChange(r: DateRange | undefined) {
    setRange(r);
    // Clear any prior errors once a full range is chosen
    if (r?.from && r?.to) {
      setError('');
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Block submission if dates are missing
    if (!range?.from || !range?.to) {
      setError('Please select your travel dates.');
      return;
    }

    setError('');
    const destParam = STARTER_PLANNER_TITLE;

    const query = new URLSearchParams({
      dest: destParam,
      start: range.from.toISOString(),
      end: range.to.toISOString(),
    }).toString();
    router.push(`/planner?${query}`);
  };

  return (
    <section className="hero relative overflow-hidden bg-grey-1 pt-[184px] px-safe lg:pt-28 md:h-auto md:pt-24 sm:pt-[92px]">
      <div className="container relative flex flex-col pt-20">
        <div className="relative z-10 flex flex-col-reverse items-center gap-10 lg:flex-row lg:items-start">
          <div className="flex w-full items-start gap-4 sm:gap-6 md:gap-8 lg:gap-10">
            {/* Text */}
            <div className="flex-1 pb-[5dvh] lg:pb-[15dvh]">
              <h1 className="font-title font-semibold leading-[0.9] tracking-tight text-foreground text-[32px] sm:text-[40px] md:text-[56px] lg:text-[72px] xl:text-[84px] pb-6">
                Turistar App
                <br />
                for your trip
              </h1>

              <form onSubmit={handleSubmit} noValidate>
                <fieldset className="pb-4 flex" aria-labelledby="daterange-label">
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
                    className="text-[var(--destructive)] text-sm mt-2"
                  >
                    {error}
                  </p>
                )}
              </form>
            </div>
          </div>
          {/* Mascot */}
          <div className="absolute bottom-0 right-[10%] w-[40%] min-w-[100px] max-w-[280px] lg:w-[36%] lg:max-w-[420px] lg:right-[20%]">
            <Image
              src="/images/mascot_1_.webp"
              alt=""
              role="presentation"
              width={800}
              height={600}
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* App Preview */}
        <div className="relative z-10 w-[90%] rounded-t-md lg:left-0 lg:w-[78.4%] overflow-hidden">
          {/* Imagem */}
          <Image
            src="/previews/preview_01.png"
            alt="Screenshot of the planner interface"
            width={1600}
            height={900}
            className="w-full rounded-t-lg shadow-xl"
          />

          <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to bottom, transparent 0%, var(--background) 90%)',
                height: '100%',
              }}
            />
            <div
              className="absolute bottom-0 left-0 right-0 h-5"
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
