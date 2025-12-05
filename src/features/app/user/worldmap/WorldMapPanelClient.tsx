'use client';

import dynamic from 'next/dynamic';

import type { WorldMapMarker } from './WorldMapPanel';

const DynamicWorldMapPanel = dynamic(
  () => import('./WorldMapPanel').then((mod) => mod.WorldMapPanel),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <p className="text-xs text-muted-foreground">Loading map...</p>
      </div>
    ),
  }
);

type WorldMapPanelClientProps = {
  markers: WorldMapMarker[];
  highlightPlanId?: string;
  className?: string;
};

export function WorldMapPanelClient({
  markers,
  highlightPlanId,
  className,
}: WorldMapPanelClientProps) {
  return (
    <DynamicWorldMapPanel
      markers={markers}
      highlightPlanId={highlightPlanId}
      className={className}
    />
  );
}
