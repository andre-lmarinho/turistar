"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { projectCountryPoint } from "@/modules/user/lib/projectCountryPoint";

import { cn } from "@/ui/utils/cn";

export type TravelCountry = {
  code: string;
  tripCount: number;
  locationCount: number;
  trips: { id: string; title: string }[];
};

type MapCountry = { code: string; name: string; path: string };
type Polygon = { type: "Polygon"; coordinates: [number, number][][] };
type MultiPolygon = { type: "MultiPolygon"; coordinates: [number, number][][][] };
type CountryCollection = {
  features: {
    geometry: Polygon | MultiPolygon | null;
    properties: { name: string; "ISO3166-1-Alpha-2": string };
  }[];
};

// The local boundaries are already simplified and split at the antimeridian.
// Equal Earth preserves relative country areas without a tile service.
function countryPath(geometry: Polygon | MultiPolygon | null): string {
  if (!geometry) return "";
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  return polygons
    .flatMap((polygon) =>
      polygon.map(
        (ring) =>
          `${ring
            .map(
              ([longitude, latitude], index) =>
                `${index === 0 ? "M" : "L"}${projectCountryPoint(longitude, latitude)}`
            )
            .join(" ")}Z`
      )
    )
    .join(" ");
}

export function DestinationsMap({ countries }: { countries: TravelCountry[] }) {
  const t = useTranslations();
  const [boundaries, setBoundaries] = useState<MapCountry[] | null>(null);
  const [failed, setFailed] = useState(false);
  const request = useRef<AbortController | null>(null);
  const [hover, setHover] = useState<(MapCountry & { x: number; y: number }) | null>(null);
  const descriptionId = useId();

  const loadBoundaries = useCallback(() => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setFailed(false);
    fetch("/data/countries.geojson", { cache: "force-cache", signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load travel map country boundaries");
        return response.json() as Promise<CountryCollection>;
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        setBoundaries(
          data.features
            .map((feature) => ({
              code: feature.properties["ISO3166-1-Alpha-2"].toLowerCase(),
              name: feature.properties.name,
              path: countryPath(feature.geometry),
            }))
            .filter((country) => country.code !== "aq" && country.path)
        );
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
  }, []);

  useEffect(() => {
    loadBoundaries();
    return () => request.current?.abort();
  }, [loadBoundaries]);

  const visited = countries.find((country) => country.code.trim().toLowerCase() === hover?.code);

  function showCountry(target: EventTarget, pointer?: { clientX: number; clientY: number }) {
    if (!(target instanceof SVGElement)) return;
    const country = boundaries?.find((item) => item.name === target.dataset.country);
    if (!country) return;
    const bounds = target.ownerSVGElement?.parentElement?.getBoundingClientRect();
    if (!bounds) return;
    const countryBounds = target.getBoundingClientRect();
    setHover({
      ...country,
      x: Math.max(
        116,
        Math.min(
          bounds.width - 116,
          (pointer?.clientX ?? countryBounds.x + countryBounds.width / 2) - bounds.left
        )
      ),
      y: Math.max(64, (pointer?.clientY ?? countryBounds.y) - bounds.top),
    });
  }

  if (failed)
    return (
      <div className="flex min-h-75 w-full flex-col items-center justify-center gap-3 rounded-xl bg-white p-6 text-center shadow-sm">
        <p className="text-muted-foreground text-sm" role="alert">
          We couldn’t load your travel map.
        </p>
        <button
          type="button"
          className="text-foreground rounded-md border px-4 py-2 text-sm focus-visible:outline-2 focus-visible:outline-ring"
          onClick={loadBoundaries}>
          Try again
        </button>
      </div>
    );

  if (!boundaries)
    return (
      <div
        className="bg-muted min-h-75 w-full rounded-xl shadow-sm motion-safe:animate-pulse md:min-h-105"
        role="status">
        <span className="sr-only">Loading travel map…</span>
      </div>
    );

  return (
    <div className="w-full rounded-xl bg-white p-4 shadow-sm md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-muted-foreground flex items-center gap-4 text-xs">
          <span className="flex items-center gap-2">
            <span className="bg-primary h-2.5 w-2.5 rounded-sm" />
            {t("mapVisited")}
          </span>
          <span className="flex items-center gap-2">
            <span className="bg-muted border-border h-2.5 w-2.5 rounded-sm border" />
            {t("mapYetToExplore")}
          </span>
        </div>
      </div>
      <figure
        className="relative mx-auto max-w-5xl py-5"
        onMouseOver={(event) => showCountry(event.target, event)}
        onMouseOut={() => setHover(null)}
        onFocus={(event) => showCountry(event.target)}
        onClick={(event) => showCountry(event.target)}
        onBlur={() => setHover(null)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setHover(null);
        }}>
        <svg viewBox="0 0 1000 460" className="w-full overflow-visible" aria-label={t("worldTravelMap")}>
          <title>{t("worldTravelMap")}</title>
          {boundaries.map((country) => {
            const isVisited = countries.some(
              (visitedCountry) => visitedCountry.code.trim().toLowerCase() === country.code
            );
            const isSelected = hover?.name === country.name;
            return (
              <path
                key={country.name}
                d={country.path}
                fillRule="evenodd"
                vectorEffect="non-scaling-stroke"
                strokeWidth={0.7}
                data-country={country.name}
                tabIndex={0}
                aria-label={`${country.name} — ${isVisited ? t("mapVisited") : t("notVisitedYet")}`}
                aria-describedby={isSelected ? descriptionId : undefined}
                className={cn(
                  "stroke-white cursor-pointer focus-visible:outline-2 focus-visible:outline-ring",
                  isVisited ? "fill-primary" : "fill-muted",
                  isSelected && "fill-primary/60"
                )}
              />
            );
          })}
        </svg>
        {hover ? (
          <div
            id={descriptionId}
            role="tooltip"
            className="bg-popover text-popover-foreground border-border pointer-events-none absolute z-10 w-56 -translate-x-1/2 -translate-y-full rounded-lg border px-3 py-2 shadow-md"
            style={{ left: hover.x, top: hover.y - 12 }}>
            <p className="text-sm font-semibold">{hover.name}</p>
            <p className="text-muted-foreground text-xs">{visited ? t("mapVisited") : t("notVisitedYet")}</p>
            {visited ? (
              <>
                <p className="text-muted-foreground mt-2 text-xs tabular-nums">
                  {t("tripCount", { count: visited.tripCount })} ·{" "}
                  {t("locationCount", { count: visited.locationCount })}
                </p>
                <ul className="text-muted-foreground mt-2 text-xs">
                  {visited.trips.map((trip) => (
                    <li className="wrap-break-word" key={trip.id}>
                      {trip.title}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        ) : null}
      </figure>
    </div>
  );
}
