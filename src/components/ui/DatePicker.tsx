// src/components/ui/DatePicker.tsx

import * as React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger, Calendar } from '@/components';
import { cn } from '@/lib/utils';

interface Props {
  className?: string;
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
}

export function DateRangePicker({ className, value, onChange }: Props) {
  const [open, setOpen] = React.useState(false);

  const label = value?.from
    ? value.to
      ? `${format(value.from, 'LLL dd')} – ${format(value.to, 'LLL dd, y')}`
      : format(value.from, 'LLL dd, y')
    : 'Pick a date range';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'space-x-4 flex items-center justify-between rounded border px-4 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary transition',
            !value?.from && 'text-muted-foreground italic',
            className
          )}
          aria-label="Pick a date range"
        >
          <span>{label}</span>
          <CalendarIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="p-0 mt-2 shadow-lg min-w-[500px]" align="start" side="bottom">
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
