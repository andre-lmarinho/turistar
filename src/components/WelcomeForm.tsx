// src/components/WelcomeForm.tsx
'use client';

import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/ui/DatePicker';
import { Button } from '@/components/ui/button';
import DestinationAutoSuggest, { Suggestion } from './DestinationAutoSuggest';
import { useRouter } from 'next/navigation';
import { addDays } from 'date-fns';
import Image from 'next/image';

export default function WelcomeForm() {
  const router = useRouter();

  // State to handle user-typed destination
  const [destination, setDestination] = useState<string>('');

  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  // Declare error state
  const [error, setError] = useState<string>('');

  const handleSubmit = () => {
    // Block submission if dates are missing or destination is empty
    if (!range?.from || !range?.to || !destination.trim()) {
      setError('Please enter a destination.'); // Show error message
      return;
    }

    setError('');

    // Dynamic destination from user input, cleaned to lower case and trimmed
    const destParam = destination.split(',')[0].trim().toLowerCase();

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
              Let&#39;s Start Your Adventure?
            </h1>
          </div>

          <div
            className="p-4 rounded-xl space-y-4"
            style={{ backgroundColor: 'var(--background)' }}
          >
            {/* Destination Field 
            MVP ONLY Suport Salvador*/}
            <div className="flex flex-col hidden">
              <label className="text-sm font-medium mb-1">Destination</label>
              <DestinationAutoSuggest
                onSelect={(item: Suggestion) => {
                  setDestination(item.name);
                  setError('');
                }}
              />
            </div>
            <div>
              <p className="text-xs italic">(More Locations Soon)</p>
            </div>
            {/*MVP ONLY Suport Salvador*/}

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
