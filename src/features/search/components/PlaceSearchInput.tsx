"use client";

import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { useState } from "react";
import { SuggestionCombobox } from "@/ui/components/combobox/SuggestionCombobox";
import { Spinner } from "@/ui/components/loading/Spinner";
import { usePlaceSuggestions } from "../hooks/usePlaceSuggestions";
import type { AutocompletePlace, PlaceSearch } from "../types";
import { MIN_SEARCH_LENGTH } from "../types";

type Props = Omit<ComponentProps<"input">, "value" | "onChange"> & {
  source: PlaceSearch;
  value: string;
  onChange: (value: string | AutocompletePlace) => void;
  latitude?: number;
  longitude?: number;
};

export function PlaceSearchInput({ source, value, onChange, latitude, longitude, ...props }: Props) {
  const t = useTranslations();
  const [requested, setRequested] = useState(false);
  const [query, setQuery] = useState<string | null>(null);
  const searchable = query !== null && query.length >= MIN_SEARCH_LENGTH;
  const open = requested && searchable;
  const { data, isError } = usePlaceSuggestions(source, searchable ? query : "", latitude, longitude);
  const busy = open && !data && !isError;
  return (
    <SuggestionCombobox
      {...props}
      value={value}
      open={open}
      onOpenChange={(next) => {
        if (next) setQuery((current) => current ?? value.trim());
        setRequested(next);
      }}
      onChange={(next) => {
        if (typeof next === "string") setQuery(next.trim());
        onChange(next);
      }}
      aria-busy={busy}
      items={data ?? []}
      itemKey={(p) => p.placeId ?? `${p.name}:${p.latitude}:${p.longitude}`}
      itemLabel={(p) => p.name}
      status={
        isError ? (
          t(source === "search" ? "failedToLoadSuggestions" : "failedToLoadLocations")
        ) : busy ? (
          <>
            <Spinner className="size-4" />
            <span className="sr-only">{t("loadingDefault")}</span>
          </>
        ) : (
          !data?.length && t("noSuggestionsFound")
        )
      }
      renderItem={(p) => (
        <>
          <span>{p.name}</span>
          {source === "search" && (
            <span className="text-muted-foreground text-xs">
              {[p.formatted, p.category].filter(Boolean).join(" · ")}
            </span>
          )}
        </>
      )}
    />
  );
}
