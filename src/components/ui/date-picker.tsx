// src/components/ui/date-picker.tsx
"use client";

import * as React from "react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Calendar } from "./calendar";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  value: DateRange | undefined;                           
  onChange: (range: DateRange | undefined) => void;
}

export function DateRangePicker({ className, value, onChange }: Props) {
  const [open, setOpen] = React.useState(false);

  const label =
    value?.from
      ? value.to
        ? `${format(value.from, "LLL dd")} – ${format(value.to, "LLL dd, y")}`
        : format(value.from, "LLL dd, y")
      : "Pick a date range";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "w-full justify-start text-left rounded-md border px-4 py-2 text-sm",
            !value?.from && "text-muted-foreground",
            className
          )}
          aria-label="Pick a date range"
        >
          {label}
        </button>
      </PopoverTrigger>

      <PopoverContent className="p-0" align="start">
        <Calendar
          mode="range"
          selected={value}
          onSelect={onChange}
          defaultMonth={value?.from}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
