// src/tests/integration/mapRender.spec.tsx

import React from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import MapView from '@/app/planner/MapView';
import type { DayPlan } from '@/types';

const map = { fitBounds: vi.fn() };
const markers: Array<{ title?: string }> = [];

vi.mock('react-leaflet', () => {
  const React = require('react');
  return {
    MapContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    TileLayer: () => null,
    Marker: (props: { title?: string }) => {
      markers.push(props);
      return null;
    },
    Polyline: () => null,
    useMap: () => map,
  };
});

vi.mock('leaflet', () => ({
  __esModule: true,
  default: {
    divIcon: () => ({}),
    latLngBounds: vi.fn(() => ({})),
  },
}));

afterEach(() => {
  map.fitBounds.mockClear();
  markers.length = 0;
});

describe('map render integration', () => {
  it('renders markers for activities', () => {
    const days: DayPlan[] = [
      {
        id: 'd1',
        label: 'Day 1',
        activities: [{ id: 'a1', title: 'Walk', color: 'red', latitude: 1, longitude: 1 }],
      },
    ];

    render(<MapView days={days} onSelectActivity={() => {}} />);
    expect(markers[0].title).toBe('Walk');
  });
});
