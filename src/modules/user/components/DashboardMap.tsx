"use client";

import dynamic from "next/dynamic";

import type { MapPin as MapPinType } from "@/features/mapBoard/DestinationsMap";
import { MapPin } from "@/shared/ui/icon";

// react-leaflet touches window on import, so the map is client-only. Fixed height
// reserves space (no CLS) and the skeleton fills it while the chunk loads.
const DestinationsMap = dynamic(
  () => import("@/features/mapBoard/DestinationsMap").then((m) => m.DestinationsMap),
  {
    ssr: false,
    loading: () => <div className="bg-muted h-full w-full animate-pulse" />,
  }
);

export function DashboardMap({ pins }: { pins: MapPinType[] }) {
  return (
    <div className="border-border bg-card relative h-75 w-full overflow-hidden rounded-xl border shadow-sm md:h-105">
      <DestinationsMap pins={pins} />
      {pins.length === 0 && (
        <div className="bg-card/70 pointer-events-none absolute inset-0 z-500 flex flex-col items-center justify-center gap-2 text-center backdrop-blur-[1px]">
          <MapPin className="text-muted-foreground h-6 w-6" aria-hidden="true" />
          <p className="text-muted-foreground max-w-xs text-sm">
            Add destinations to your planners and they&apos;ll appear here.
          </p>
        </div>
      )}
    </div>
  );
}
