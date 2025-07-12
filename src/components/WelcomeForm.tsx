// src/components/WelcomeForm.tsx
'use client';

import { useState } from 'react';
import { DateRange } from 'react-day-picker';
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
    <div className="items-center text-center max-w-[400px]">
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--card)' }}>
        <div className="space-y-6 p-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Let&#39;s Plan Your Next Trip to Salvador?</h1>
          </div>

          <div className="space-y-4 flex justify-center">
            <DateRangePicker value={range} onChange={setRange} />
          </div>
          <Button type="button" onClick={handleSubmit}>
            Start Your Planning
          </Button>

          {error && <p className="text-[var(--destructive)] text-sm">{error}</p>}
        </div>
      </div>
    </div>
  );
}
