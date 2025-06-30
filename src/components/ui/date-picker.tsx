// src/components/ui/date-picker.tsx
"use client";

import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Calendar } from "./calendar";
import { cn } from "@/lib/utils";
import { addDays, format } from "date-fns";

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export function DateRangePicker({
  className,
  value,
  onChange
}: {
  className?: string;
  value: DateRange;
  onChange: (range: DateRange) => void;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "w-full justify-start text-left rounded-md border px-4 py-2 text-sm",
            !value.from && "text-muted-foreground",
            className
          )}
        >
          {value.from ? (
            value.to ? (
              `${format(value.from, "LLL dd")} – ${format(value.to, "LLL dd, y")}`
            ) : (
              format(value.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Calendar
          mode="range"
          selected={value}
          onSelect={(range: DateRange) => onChange(range)}
          defaultMonth={value?.from}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
