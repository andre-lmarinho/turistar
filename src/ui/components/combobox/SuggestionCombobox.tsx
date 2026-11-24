"use client";

import { Autocomplete } from "@base-ui/react/autocomplete";
import type { ComponentProps, ReactNode } from "react";

type Props<T> = Omit<ComponentProps<"input">, "onChange" | "value"> & {
  value: string;
  onChange: (value: string | T) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: T[];
  itemKey: (item: T) => string;
  itemLabel: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  status: ReactNode;
};

export function SuggestionCombobox<T>({
  value,
  open,
  onOpenChange,
  onChange,
  items,
  itemKey,
  itemLabel,
  renderItem,
  status,
  className,
  ...input
}: Props<T>) {
  return (
    <Autocomplete.Root
      value={value}
      open={open}
      openOnInputClick
      onOpenChange={onOpenChange}
      onValueChange={(next, details) => {
        if (details.reason === "input-change" || details.reason === "input-clear") onChange(next);
      }}
      items={items}
      filter={null}
      itemToStringValue={itemLabel}>
      <Autocomplete.Input
        {...input}
        autoComplete="off"
        className={
          className ??
          "bg-background focus:ring-ring w-full rounded-md border border-input px-4 py-2 focus:ring-2 focus:outline-none"
        }
      />
      <Autocomplete.Portal>
        <Autocomplete.Positioner sideOffset={4} className="z-60 w-(--anchor-width) max-w-(--available-width)">
          <Autocomplete.Popup className="max-h-(--available-height) overflow-y-auto overscroll-contain rounded-md border bg-background text-sm text-foreground shadow-md">
            {status && <Autocomplete.Status className="block px-3 py-2">{status}</Autocomplete.Status>}
            <Autocomplete.List>
              {(item: T) => (
                <Autocomplete.Item
                  key={itemKey(item)}
                  value={item}
                  onClick={() => onChange(item)}
                  className="flex min-h-11 cursor-pointer flex-col justify-center px-3 py-2 data-highlighted:bg-folio-highlight hover:bg-folio-highlight">
                  {renderItem(item)}
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  );
}
