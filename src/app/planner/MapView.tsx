// src/app/planner/MapView.tsx
'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L, { LatLngExpression, LeafletMouseEvent } from 'leaflet';
import { usePlannerContext } from '@/contexts';

interface MapViewProps {}

// Extract the CSS color from a Tailwind class like "bg-[var(--color-X)]"
const getCssColor = (cls: string): string => {
  const m = cls.match(/^bg-\[([^]+)\]$/);
  return m ? m[1] : cls;
};

// Fit map view to all markers whenever coordinates change
function FitAllMarkers({ coords }: { coords: LatLngExpression[] }) {
  const map = useMap();
  const prev = useRef<LatLngExpression[] | null>(null);

  useEffect(() => {
    if (coords.length === 0) return;

    const same =
      prev.current &&
      prev.current.length === coords.length &&
      prev.current.every((c, i) => {
        const a = c as [number, number];
        const b = coords[i] as [number, number];
        return a[0] === b[0] && a[1] === b[1];
      });

    if (!same) {
      map.fitBounds(L.latLngBounds(coords), { padding: [50, 50] });
      prev.current = coords;
    }
  }, [coords, map]);

  return null;
}

export default function MapView() {
  const { days, setSelectedActivity, destCoords } = usePlannerContext();
  const centerCoords = destCoords ?? undefined;
  const dayPaths = useMemo(
    () =>
      days
        .map((day, dayIdx) => {
          const acts = day.activities.filter((a) => a.latitude != null && a.longitude != null);
          const coords = acts.map((a) => [a.latitude!, a.longitude!] as LatLngExpression);
          return { day, dayIdx, coords, acts };
        })
        .filter((d) => d.coords.length > 0),
    [days]
  );

  const allCoords = useMemo(() => dayPaths.flatMap((d) => d.coords), [dayPaths]);
  const center: LatLngExpression = allCoords.length
    ? allCoords[0]
    : centerCoords
      ? [centerCoords.lat, centerCoords.lng]
      : [0, 0];
  return (
    <div className="bg-background relative h-full w-full overflow-hidden rounded-xl border">
      <MapContainer
        center={center}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        aria-label="Itinerary map"
      >
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
                  title={act.title}
                  eventHandlers={{
                    click: () =>
                      setSelectedActivity({
                        ...act,
                        dayId: day.id,
                      }),
                    contextmenu: (e: LeafletMouseEvent) => {
                      e.originalEvent.preventDefault();
                      setSelectedActivity({
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
