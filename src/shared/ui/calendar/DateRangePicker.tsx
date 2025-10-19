import * as React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from '@/shared/ui/icon';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '../../../shared/ui/popover';
import { Calendar } from './Calendar';
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
        <button
          type="button"
          className={cn(
            'border-border bg-background text-foreground inline-flex w-full cursor-pointer items-center justify-between gap-4 rounded-md border px-3 py-2 text-sm font-normal transition-colors',
            !value?.from && 'text-muted-foreground',
            className
          )}
          aria-label={label}
        >
          <span
            className={cn(
              'flex-1 truncate text-left',
              !value?.from && 'text-muted-foreground italic'
            )}
          >
            {label}
          </span>
          <CalendarIcon className="text-muted-foreground size-4" aria-hidden="true" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="mt-2 w-full max-w-[27rem] p-0 shadow-lg"
        align="start"
        side="bottom"
      >
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
        <button
          type="button"
          title={label}
          aria-label={label}
          className={cn(
            'border-border bg-background text-foreground hover:bg-muted/60 inline-flex size-10 cursor-pointer items-center justify-center rounded-[var(--radius)] border px-2 transition-colors',
            className
          )}
        >
          <CalendarIcon className="size-5" aria-hidden="true" />
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
