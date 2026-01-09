"use client";

import { useEffect } from "react";

import worldMapData from "@/features/visitedCountries/data/world-map-data.json";
import type { VisitedCountryId } from "@/features/visitedCountries/lib/getVisitedCountries";

interface WorldMapViewProps {
  visitedCountries: VisitedCountryId[];
}

export function WorldMapView({ visitedCountries }: WorldMapViewProps) {
  useEffect(() => {
    if (!Array.isArray(visitedCountries) || !visitedCountries.length) return undefined;

    const visitedIds = Array.from(
      new Set(
        visitedCountries
          .map((id) => id?.trim().toUpperCase())
          .filter((countryId): countryId is string => Boolean(countryId))
      )
    );

    if (!visitedIds.length) return undefined;

    const appliedCountries = new Set<string>();

    visitedIds.forEach((countryId) => {
      const pathElement = document.getElementById(countryId);

      if (!pathElement) return;

      pathElement.classList.add("visited");
      appliedCountries.add(countryId);
    });

    return () => {
      appliedCountries.forEach((countryId) => {
        document.getElementById(countryId)?.classList.remove("visited");
      });
    };
  }, [visitedCountries]);

  return (
    <div className="bg-card relative max-h-dvh w-full rounded-xl border p-4">
      <style jsx global>
        {`
        .map-traveling path {
          fill-rule: evenodd;
          stroke: color-mix(in oklab, var(--border) 72%, var(--card-foreground) 28%);
          fill: color-mix(in oklab, var(--card) 45%, var(--muted) 55%);
        }
      `}
      </style>
      <style jsx>
        {`
        path.visited {
          fill: var(--muted-foreground);
          cursor: pointer;
          transition: all 0.1s ease-out;
        }
        path.visited:hover {
          fill: color-mix(in oklab, var(--muted-foreground) 65%, var(--foreground) 35%);
        }
      `}
      </style>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMinYMin meet"
        viewBox={worldMapData.viewBox}
        className="map-traveling">
        <title>World map showing visited countries</title>
        <defs></defs>
        <g id="countries">
          {worldMapData.countries.map((country) => (
            <path
              key={country.id}
              id={country.id}
              d={country.path}
              data-id={country.id}
              data-name={country.name}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
