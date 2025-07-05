import * as React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/PopOver';
import { Calendar } from '@/components/ui/Calendar';
import { Button } from '@/components/ui/button';
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
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'w-full flex items-center justify-between bg-background',
            !value?.from && 'text-muted-foreground italic',
            className
          )}
          aria-label="Pick a date range"
        >
          <span>{label}</span>
          <CalendarIcon className="h-4 w-4 text-gray-400" />
        </Button>
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
