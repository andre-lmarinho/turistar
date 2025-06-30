"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DateRangePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addDays } from "date-fns";

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export default function WelcomeForm() {
  const router = useRouter();

  const [destination, setDestination] = useState("");
  // Optional: start today and default to 7-day trip
  const [range, setRange] = useState<DateRange>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  const handleSubmit = () => {
    const { from, to } = range;
    if (!destination || !from || !to) return; // require all fields

    const query = new URLSearchParams({
      dest: destination,
      start: from.toISOString(),
      end: to.toISOString(),
    }).toString();

    router.push(`/planner?${query}`);
  };

  return (
    <div className="max-w-md space-y-4">
      <Input
        placeholder="Destination (e.g., Salvador)"
        value={destination}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setDestination(e.target.value)
        }
      />

      <DateRangePicker value={range} onChange={setRange} />

      <Button className="w-full" onClick={handleSubmit}>
        Create Itinerary
      </Button>
    </div>
  );
}
