"use client";

import { format } from "date-fns";
import { useTranslations } from "next-intl";
import * as React from "react";
import type { DateRange } from "react-day-picker";

import { Calendar as CalendarIcon } from "@/ui/components/icon";
import { Popover, PopoverContent, PopoverTriggerButton } from "@/ui/components/popover";
import { cn } from "@/ui/utils/cn";
import { Calendar } from "./Calendar";

interface Props {
  className?: string;
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  disabled?: boolean;
  iconOnly?: boolean;
}

export function DateRangePicker({ className, value, onChange, disabled = false, iconOnly = false }: Props) {
  const [open, setOpen] = React.useState(false);
  const t = useTranslations();

  const label = value?.from
    ? value.to
      ? `${format(value.from, "LLL dd")} - ${format(value.to, "LLL dd, y")}`
      : format(value.from, "LLL dd, y")
    : t("pickDateRange");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTriggerButton
        aria-label={label}
        title={iconOnly ? label : undefined}
        data-testid={iconOnly ? "date-picker" : undefined}
        className={cn(
          iconOnly
            ? "text-foreground hover:bg-muted/60 inline-flex size-8 cursor-pointer items-center justify-center rounded-sm px-2 transition-colors"
            : "border-border bg-background text-foreground inline-flex w-full cursor-pointer items-center justify-between gap-4 rounded-md border px-3 py-2 text-sm font-normal transition-colors",
          !iconOnly && !value?.from && "text-muted-foreground",
          className
        )}
        disabled={disabled}>
        {iconOnly ? (
          <CalendarIcon className="size-4" aria-hidden="true" />
        ) : (
          <>
            <span className={cn("flex-1 truncate text-left", !value?.from && "text-muted-foreground italic")}>
              {label}
            </span>
            <CalendarIcon className="text-muted-foreground size-4" aria-hidden="true" />
          </>
        )}
      </PopoverTriggerButton>

      <PopoverContent
        className={cn("mt-2 p-0 shadow-lg", iconOnly ? "min-w-125" : "w-full max-w-108")}
        align="start"
        side="bottom">
        <Calendar
          mode="range"
          selected={value}
          onSelect={onChange}
          defaultMonth={value?.from}
          numberOfMonths={2}
          disabled={disabled ? () => true : undefined}
        />
      </PopoverContent>
    </Popover>
  );
}
