"use client";

import { format } from "date-fns";
import { enUS, ptBR } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import * as React from "react";
import type { DateRange } from "react-day-picker";

import { Calendar as CalendarIcon } from "@/ui/components/icon";
import { Popover, PopoverContent, PopoverTriggerButton } from "@/ui/components/popover";
import { cn } from "@/ui/utils/cn";
import { Calendar } from "./Calendar";

interface Props extends Omit<React.ComponentPropsWithoutRef<"button">, "value" | "onChange" | "children"> {
  className?: string;
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  disabled?: boolean;
  iconOnly?: boolean;
}

export const DateRangePicker = React.forwardRef<HTMLButtonElement, Props>(function DateRangePicker(
  { className, value, onChange, disabled = false, iconOnly = false, ...props },
  ref
) {
  const [open, setOpen] = React.useState(false);
  const t = useTranslations();
  const locale = useLocale() === "pt-BR" ? ptBR : enUS;
  const datePattern = locale === ptBR ? "dd LLL" : "LLL dd";
  const dateWithYearPattern = locale === ptBR ? "dd LLL y" : "LLL dd, y";

  const label = value?.from
    ? value.to
      ? `${format(value.from, datePattern, { locale })} - ${format(value.to, dateWithYearPattern, { locale })}`
      : format(value.from, dateWithYearPattern, { locale })
    : t("pickDateRange");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTriggerButton
        {...props}
        ref={ref}
        aria-label={props["aria-label"] ?? label}
        title={iconOnly ? label : undefined}
        data-testid={iconOnly ? "date-picker" : undefined}
        className={cn(
          iconOnly
            ? "text-foreground hover:bg-muted/60 inline-flex size-8 cursor-pointer items-center justify-center rounded-sm px-2 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            : "border-border bg-background text-foreground inline-flex w-full cursor-pointer items-center justify-between gap-4 rounded-md border px-3 py-2 text-sm font-normal transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
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

      <PopoverContent className="p-0 shadow-lg" align="start" side="bottom" sideOffset={8}>
        <Calendar
          locale={locale}
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
});
