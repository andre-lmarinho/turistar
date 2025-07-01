// src/components/WelcomeForm.tsx
"use client";

import { useState } from "react";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { addDays } from "date-fns";

export default function WelcomeForm() {
  const router = useRouter();

  /* state ---------------------------------------------------------------- */
  const destination = "salvador";                      // fix destination MVP
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  /* handlers ------------------------------------------------------------- */
  const handleSubmit = () => {
    if (!destination || !range?.from || !range?.to) return;
    const query = new URLSearchParams({
      dest: destination,
      start: range.from.toISOString(),
      end: range.to.toISOString(),
    }).toString();
    router.push(`/planner?${query}`);
  };

  
  

  /* render --------------------------------------------------------------- */
  return (
    <div className="max-w-md space-y-4 text-center">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold">
          Travel Planner
        </h1>
        <p className="italic">Salvador Only (MVP)</p>
      </div>

      {/* accept undefined directly */}
      <DateRangePicker value={range} onChange={setRange} />

      <Button className="w-full" onClick={handleSubmit}>
        Create Itinerary
      </Button>
    </div>
  );
}
