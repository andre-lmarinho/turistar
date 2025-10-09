// src/shared/ui/calendar/DateRangePicker.tsx

import * as React from 'react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { Calendar } from './Calendar';
import { Button } from '../button';
import { cn } from '@/shared/utils/cn';

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
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            'w-64 justify-between gap-4 text-sm font-normal',
            !value?.from && 'text-muted-foreground',
            className
          )}
          aria-label={label}
          icon="calendar"
          iconPosition="right"
          iconProps={{ className: 'text-muted-foreground h-4 w-4' }}
        >
          <span
            className={cn(
              'flex-1 truncate text-left',
              !value?.from && 'text-muted-foreground italic'
            )}
          >
            {label}
          </span>
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

// Icon-only version matching button icon style
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
          size="icon"
          tooltipSide="bottom"
          title={label}
          aria-label={label}
          className={className}
          icon="calendar"
          iconProps={{ className: 'h-4 w-4' }}
        />
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
