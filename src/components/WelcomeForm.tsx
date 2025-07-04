// src/components/WelcomeForm.tsx
'use client';

import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/ui/DatePicker';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { addDays } from 'date-fns';
import Image from 'next/image';

export default function WelcomeForm() {
  const router = useRouter();

  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  const handleSubmit = () => {
    if (!range?.from || !range?.to) return;
    const query = new URLSearchParams({
      dest: 'salvador',
      start: range.from.toISOString(),
      end: range.to.toISOString(),
    }).toString();
    router.push(`/planner?${query}`);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
    >
      <div
        className="max-w-4xl w-full flex flex-col md:flex-row p-0 rounded-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--card)' }}
      >
        {/* Left Side: Text and Form */}
        <div className="flex-1 space-y-6 text-left p-8">
          <div>
            <h1 className="text-5xl font-bold mb-2">
              Create Your Adventure with Our One-Boot Hippo!
            </h1>
          </div>

          <div
            className="p-4 rounded-xl space-y-4"
            style={{ backgroundColor: 'var(--background)' }}
          >
            {/* Destination Field */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Destination</label>
              <input
                type="text"
                value="Salvador, Brazil"
                readOnly
                className="border rounded px-3 py-2 cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--muted)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-muted)',
                }}
              />
            </div>

            <DateRangePicker value={range} onChange={setRange} />
          </div>

          <div className="flex justify-end">
            <Button className="cursor-pointer" onClick={handleSubmit}>
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
