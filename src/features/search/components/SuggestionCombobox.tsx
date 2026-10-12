"use client";

import { useTranslations } from "next-intl";
import React from "react";

import { Spinner } from "@/ui/components/loading";
import { cn } from "@/ui/utils/cn";

export interface SuggestionOption<T> {
  id: string;
  label: string;
  description?: string;
  meta?: string;
  value: T;
}

interface SuggestionComboboxProps<T, TSelection = T> {
  id?: string;
  label?: string;
  placeholder?: string;
  value: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInputChange: (value: string) => void;
  options: SuggestionOption<T>[];
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  className?: string;
  inputClassName?: string;
  renderOption?: (option: SuggestionOption<T>, state: { active: boolean }) => React.ReactNode;
  onFocus?: () => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  inputProps?: Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "id" | "value" | "onChange" | "role" | "aria-expanded" | "aria-controls" | "aria-activedescendant"
  >;
  mapOptionToSelection: (option: SuggestionOption<T>) => TSelection;
  onSelect: (selection: TSelection, option: SuggestionOption<T>) => void;
}

export function SuggestionCombobox<T, TSelection = T>(props: SuggestionComboboxProps<T, TSelection>) {
  const {
    id,
    label,
    placeholder,
    value,
    open,
    onOpenChange,
    onInputChange,
    options,
    loading,
    error,
    emptyMessage,
    className,
    inputClassName,
    renderOption,
    onFocus,
    onBlur,
    inputRef,
    inputProps,
  } = props;
  const t = useTranslations();
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const listId = `${inputId}-suggestions`;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const localInputRef = React.useRef<HTMLInputElement>(null);
  const resolvedInputRef = inputRef ?? localInputRef;
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const listVisible = open && !error && options.length > 0;

  React.useEffect(() => {
    if (!listVisible || activeIndex < 0) return;
    containerRef.current
      ?.querySelector<HTMLElement>(`[data-option-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, listVisible]);

  React.useEffect(() => {
    setActiveIndex((prev) => {
      if (options.length === 0) return -1;
      return Math.min(prev, options.length - 1);
    });
  }, [options.length]);

  const handleSelect = (option: SuggestionOption<T>) => {
    const selection = props.mapOptionToSelection(option);
    props.onSelect(selection, option);
    onOpenChange(false);
    setActiveIndex(-1);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange(event.target.value);
    setActiveIndex(-1);
    onOpenChange(true);
  };

  const handleInputFocus = () => {
    onOpenChange(true);
    onFocus?.();
  };

  const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    onBlur?.(event);
    const related = event.relatedTarget as Node | null;
    if (related && containerRef.current?.contains(related)) {
      return;
    }
    onOpenChange(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    inputProps?.onKeyDown?.(event);
    if (event.defaultPrevented || event.nativeEvent.isComposing) return;
    if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      onOpenChange(false);
      setActiveIndex(-1);
      return;
    }
    if (event.key === "Tab") {
      onOpenChange(false);
      setActiveIndex(-1);
      return;
    }
    if (error || loading) return;
    if (event.key === "ArrowDown" && options.length > 0) {
      event.preventDefault();
      onOpenChange(true);
      setActiveIndex((idx) => (idx + 1) % options.length);
    } else if (event.key === "ArrowUp" && options.length > 0) {
      event.preventDefault();
      onOpenChange(true);
      setActiveIndex((idx) => (idx <= 0 ? options.length - 1 : idx - 1));
    } else if (event.key === "Enter" && listVisible && activeIndex >= 0) {
      const option = options[activeIndex];
      if (option) {
        event.preventDefault();
        handleSelect(option);
      }
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {label ? (
        <label htmlFor={inputId} className="sr-only">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          {...inputProps}
          id={inputId}
          ref={resolvedInputRef}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={listVisible}
          aria-busy={loading}
          aria-controls={listVisible ? listId : undefined}
          aria-activedescendant={
            listVisible && activeIndex >= 0 && options[activeIndex]
              ? `${listId}-option-${options[activeIndex].id}`
              : undefined
          }
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            inputClassName ??
              "bg-background focus:ring-ring flex w-full items-center justify-between space-x-4 rounded-md border px-4 py-2 text-base transition-colors focus:ring-2 focus:outline-none md:text-sm",
            loading && "pr-8"
          )}
          autoComplete="off"
        />
        {loading ? (
          <div className="absolute inset-y-0 right-2 flex items-center">
            <Spinner className="size-4" />
          </div>
        ) : null}
      </div>
      {error ? (
        <p className="text-destructive mt-1 text-sm" role="alert" aria-live="assertive">
          {typeof error === "string" ? error : t("failedToLoadSuggestions")}
        </p>
      ) : null}
      {open && !error ? (
        options.length > 0 ? (
          <div
            id={listId}
            role="listbox"
            aria-label={label ?? placeholder}
            className="bg-background absolute z-10 mt-1 max-h-48 w-full overscroll-contain overflow-auto rounded border text-sm shadow">
            {options.map((option, idx) => (
              <button
                key={option.id}
                id={`${listId}-option-${option.id}`}
                data-option-index={idx}
                role="option"
                aria-selected={activeIndex === idx}
                tabIndex={-1}
                type="button"
                className={cn(
                  "min-h-11 w-full px-3 py-2 text-left transition-colors",
                  activeIndex === idx ? "bg-accent" : "hover:bg-accent"
                )}
                onPointerDown={(event) => event.preventDefault()}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  handleSelect(option);
                  resolvedInputRef.current?.focus();
                }}>
                {renderOption ? (
                  renderOption(option, { active: activeIndex === idx })
                ) : (
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{option.label}</span>
                    {option.description ? (
                      <span className="text-muted-foreground text-xs">{option.description}</span>
                    ) : null}
                    {option.meta ? (
                      <span className="text-muted-foreground text-[11px] uppercase tracking-[0.08em]">
                        {option.meta}
                      </span>
                    ) : null}
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : !loading && emptyMessage ? (
          <output
            className="bg-background text-muted-foreground absolute z-10 mt-1 block w-full rounded border px-3 py-2 text-sm shadow"
            aria-live="polite">
            {emptyMessage}
          </output>
        ) : null
      ) : null}
    </div>
  );
}
