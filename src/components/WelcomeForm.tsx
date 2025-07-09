// src/components/WelcomeForm.tsx
'use client';

import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { Button, DateRangePicker } from '@/components';
import { STARTER_PLANNER_TITLE } from '@/constants';
import { useRouter } from 'next/navigation';
import { addDays } from 'date-fns';
import Image from 'next/image';

export default function WelcomeForm() {
  const router = useRouter();
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  // Declare error state
  const [error, setError] = useState<string>('');

  const handleSubmit = () => {
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
    <div className="flex items-center justify-center">
      <div
        className="max-w-4xl w-full flex flex-col md:flex-row p-0 rounded-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--card)' }}
      >
        {/* Left Side: Text and Form */}
        <div className="flex-1 space-y-6 text-left p-8">
          <div>
            <h1 className="text-4xl md:text-5xl md:min-w-100 font-bold mb-2">
              Let&#39;s Go to Bahia?
            </h1>
          </div>

          <div
            className="p-4 rounded-xl space-y-4"
            style={{ backgroundColor: 'var(--background)' }}
          >
            <DateRangePicker value={range} onChange={setRange} />
          </div>
          {error && <p className="text-[var(--destructive)] text-sm">{error}</p>}
          <div className="flex justify-end">
            <Button type="button" className="cursor-pointer" onClick={handleSubmit}>
              Start Your Adventure
            </Button>
          </div>
        </div>

        {/* Right Side: Image pinned to bottom */}
        <div className="flex-1 flex justify-center md:justify-end items-end relative">
          <Image
            src="/images/mascot_1_.webp"
            alt="Mascot Hippo"
            width={300}
            height={300}
            className="object-contain md:absolute md:bottom-0 md:right-0"
          />
        </div>
      </div>
    </div>
  );
}
