'use client';

import React, { useEffect } from 'react';
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from 'react-leaflet';
import type { LatLngExpression, LatLngBoundsExpression } from 'leaflet';
import clsx from 'clsx';

export type WorldMapMarker = {
  id: string;
  planId: string;
  planTitle: string;
  destination: string;
  country?: string | null;
  lat: number;
  lng: number;
  updatedAt?: string | null;
};

type WorldMapPanelProps = {
  markers: WorldMapMarker[];
  highlightPlanId?: string;
  className?: string;
};

const DEFAULT_CENTER: LatLngExpression = [20, 0];
const WORLD_BOUNDS: LatLngBoundsExpression = [
  [-90, -180],
  [90, 180],
];

function FitWorldBounds() {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    map.fitBounds(WORLD_BOUNDS, {
      padding: [40, 40],
      maxZoom: 1,
    });
  }, [map]);

  return null;
}

export function WorldMapPanel({ markers, highlightPlanId, className }: WorldMapPanelProps) {
  const containerClassName = clsx(
    'bg-background/60 relative w-full h-full overflow-hidden rounded-2xl min-h-[360px]',
    className
  );

  return (
    <div className={containerClassName}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={1}
        className="h-full w-full"
        style={{ width: '100%', height: '100%', minHeight: '360px' }}
        scrollWheelZoom={false}
        zoomControl={false}
        dragging={false}
        touchZoom={false}
        doubleClickZoom={false}
        keyboard={false}
        minZoom={1}
        maxZoom={5}
        maxBounds={WORLD_BOUNDS}
        maxBoundsViscosity={0.6}
        worldCopyJump={false}
        aria-label="User worldmap"
      >
        <FitWorldBounds />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
          subdomains={['a', 'b', 'c']}
          noWrap
        />
        {markers.map((marker) => {
          const isHighlight = highlightPlanId ? marker.planId === highlightPlanId : false;
          const fillColor = isHighlight ? 'var(--primary)' : 'var(--accent)';
          const strokeColor = isHighlight ? 'var(--primary-foreground)' : 'var(--foreground)';
          const radius = isHighlight ? 12 : 8;

          return (
            <CircleMarker
              key={marker.id}
              center={[marker.lat, marker.lng]}
              radius={radius}
              pathOptions={{
                color: strokeColor,
                fillColor,
                fillOpacity: 1,
                weight: 2,
              }}
            >
              <Tooltip direction="top" offset={[0, -radius]} opacity={0.9}>
                <div className="text-xs">
                  <p className="text-foreground font-semibold">{marker.planTitle}</p>
                  <p className="text-muted-foreground">{marker.destination}</p>
                  {marker.country && (
                    <p className="text-muted-foreground">Country: {marker.country}</p>
                  )}
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
