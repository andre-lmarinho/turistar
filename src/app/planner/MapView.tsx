// src/app/planner/MapView.tsx
'use client';

import React, { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L, { LatLngExpression, LeafletMouseEvent } from 'leaflet';
import type { DayPlan, Activity } from '@/types';

interface MapViewProps {
  days: DayPlan[];
  onSelectActivity: (activity: Activity & { dayId: string }) => void;
}

// Extrai a cor real da string Tailwind "bg-[var(--color-X)]"
const getCssColor = (cls: string): string => {
  const m = cls.match(/^bg-\[([^]+)\]$/);
  return m ? m[1] : cls;
};

// Roda o fitBounds só uma vez
function FitAllMarkers({ coords }: { coords: LatLngExpression[] }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (!fitted.current && coords.length > 0) {
      map.fitBounds(L.latLngBounds(coords), { padding: [50, 50] });
      fitted.current = true;
    }
  }, [map, coords]);

  return null;
}

export default function MapView({ days, onSelectActivity }: MapViewProps) {
  const dayPaths = days
    .map((day, dayIdx) => {
      const acts = day.activities.filter((a) => a.latitude != null && a.longitude != null);
      const coords = acts.map((a) => [a.latitude!, a.longitude!] as LatLngExpression);
      return { day, dayIdx, coords, acts };
    })
    .filter((d) => d.coords.length > 0);

  const allCoords = dayPaths.flatMap((d) => d.coords);
  const center: LatLngExpression = allCoords.length ? allCoords[0] : [0, 0];

  return (
    <div className="relative h-full w-full rounded-xl border bg-background overflow-hidden">
      <MapContainer center={center} zoom={13} style={{ width: '100%', height: '100%' }}>
        <FitAllMarkers coords={allCoords} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {dayPaths.map(({ day, dayIdx, coords, acts }) => (
          <React.Fragment key={day.id}>
            {coords.length > 1 && (
              <Polyline
                positions={coords}
                pathOptions={{
                  color: getCssColor(acts[0].color),
                  weight: 3,
                }}
              />
            )}

            {coords.map((pos, i) => {
              const act = acts[i];
              const bg = getCssColor(act.color);
              const number = dayIdx + 1;
              const icon = L.divIcon({
                html: `
                  <div style="
                    background: ${bg};
                    color: var(--foreground);
                    width: 28px; height: 28px;
                    border: 2px solid white;
                    border-radius: 50%;
                    line-height: 28px;
                    text-align: center;
                    font-weight: bold;
                    box-shadow: 0 0 2px rgba(0,0,0,0.5);
                  ">${number}</div>
                `,
                className: '',
                iconSize: [28, 28],
                iconAnchor: [14, 14],
              });

              return (
                <Marker
                  key={`${day.id}-${i}`}
                  position={pos}
                  icon={icon}
                  eventHandlers={{
                    click: () =>
                      onSelectActivity({
                        ...act,
                        dayId: day.id,
                      }),
                    contextmenu: (e: LeafletMouseEvent) => {
                      e.originalEvent.preventDefault();
                      onSelectActivity({
                        ...act,
                        dayId: day.id,
                      });
                    },
                  }}
                />
              );
            })}
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  );
}
