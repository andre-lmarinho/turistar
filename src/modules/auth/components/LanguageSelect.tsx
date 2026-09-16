"use client";

import { Select } from "@base-ui/react/select";
import { Check, ChevronDown, Globe2, LoaderCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useId, useState, useTransition } from "react";
import { setLocale } from "@/i18n/actions";
import { isLocale } from "@/i18n/config";
import { Button } from "@/ui/components/button/Button";

const languages = [
  { value: "en", label: "English" },
  { value: "pt-BR", label: "Português (Brasil)" },
];

export function LanguageSelect({ className }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations();
  const id = useId();
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);
  return (
    <div className={className ?? "fixed top-4 right-4 z-50 flex flex-col items-end gap-2"}>
      <Select.Root
        items={languages}
        value={locale}
        disabled={pending}
        modal={false}
        onValueChange={(value) => {
          if (!isLocale(value) || value === locale) return;
          setFailed(false);
          startTransition(async () => {
            try {
              await setLocale(value);
            } catch {
              setFailed(true);
            }
          });
        }}>
        <Select.Trigger
          render={<Button variant="ghost" />}
          aria-label={t("language")}
          aria-busy={pending}
          aria-describedby={failed ? `${id}-error` : undefined}
          className="group border-border/70 bg-background/80 text-foreground hover:bg-muted/50 active:bg-muted data-popup-open:bg-muted/50 flex min-h-11 items-center gap-2.5 rounded-full border px-3.5 py-2 text-sm font-medium shadow-md backdrop-blur-sm transition-colors duration-150 disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none">
          <Globe2 className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
          <Select.Value lang={locale} />
          {pending ? (
            <LoaderCircle
              className="size-3.5 shrink-0 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : (
            <ChevronDown
              className="text-muted-foreground size-3.5 shrink-0 transition-transform duration-150 group-data-popup-open:rotate-180 motion-reduce:transition-none"
              aria-hidden="true"
            />
          )}
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner sideOffset={8} align="end" alignItemWithTrigger={false} className="z-60">
            <Select.Popup className="border-border bg-background text-foreground w-60 max-w-[calc(100vw-2rem)] origin-(--transform-origin) rounded-2xl border p-1.5 shadow-lg outline-none transition-[opacity,transform] duration-150 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 motion-reduce:transition-none">
              <Select.List aria-label={t("language")}>
                {languages.map(({ value, label }) => (
                  <Select.Item
                    key={value}
                    value={value}
                    label={label}
                    className="data-highlighted:bg-muted/60 data-selected:bg-muted/30 flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm outline-none">
                    <Select.ItemText lang={value}>{label}</Select.ItemText>
                    <Select.ItemIndicator>
                      <Check className="size-4" aria-hidden="true" />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
      {failed ? (
        <p id={`${id}-error`} role="alert" className="text-destructive max-w-60 text-right text-sm">
          {t("languageError")}
        </p>
      ) : null}
    </div>
  );
}
