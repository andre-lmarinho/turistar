// src/components/ui/DatePicker.tsx

import * as React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger, Calendar, Button } from '@/shared/ui';
import { cn } from '@/shared/lib/utils';

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
            'bg-background focus:ring-primary flex w-64 items-center justify-between space-x-4 rounded border px-4 py-2 text-sm transition focus:ring-2 focus:outline-none',
            !value?.from && 'text-muted-foreground italic',
            className
          )}
          aria-label={label}
        >
          <span>{label}</span>
          <CalendarIcon className="text-muted-foreground h-4 w-4" aria-hidden="true" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="mt-2 min-w-[500px] p-0 shadow-lg" align="start" side="bottom">
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

// Icon-only version matching button-icons style
export function DateRangePickerIcon({ className, value, onChange }: Props) {
  const [open, setOpen] = React.useState(false);

  const label = value?.from
    ? value.to
      ? `${format(value.from, 'LLL dd')} – ${format(value.to, 'LLL dd, y')}`
      : format(value.from, 'LLL dd, y')
    : 'Pick a date range';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="icon"
          size="icon"
          position="bottom"
          title={label}
          aria-label={label}
          className={className}
        >
          <CalendarIcon aria-hidden="true" className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="mt-2 min-w-[500px] p-0 shadow-lg" align="start" side="bottom">
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
