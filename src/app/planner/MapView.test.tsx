// src/app/planner/MapView.test.tsx

import React from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import MapView from './MapView';
import type { DayPlan } from '@/types';

// Stub react-leaflet components and expose a shared map instance
const map = { fitBounds: vi.fn() };
vi.mock('react-leaflet', () => {
  const React = require('react');
  const markers: Array<{ title?: string }> = [];
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

// Simplify Leaflet utilities used by MapView
vi.mock('leaflet', () => ({
  __esModule: true,
  default: {
    divIcon: () => ({}),
    latLngBounds: vi.fn(() => ({})),
  },
}));

describe('FitAllMarkers effect', () => {
  afterEach(() => {
    map.fitBounds.mockClear();
    markers.length = 0;
  });

  const baseActivity = { id: 'a1', title: 'A1', color: 'red' };

  const buildDays = ([lat, lng]: [number, number]): DayPlan[] => [
    {
      id: 'd1',
      label: 'Day 1',
      activities: [{ ...baseActivity, latitude: lat, longitude: lng }],
    },
  ];

  it('runs when coordinates change', () => {
    const { rerender } = render(<MapView days={buildDays([1, 1])} onSelectActivity={() => {}} />);
    expect(map.fitBounds).toHaveBeenCalledTimes(1);

    // identical coordinates should not trigger fit again
    rerender(<MapView days={buildDays([1, 1])} onSelectActivity={() => {}} />);
    expect(map.fitBounds).toHaveBeenCalledTimes(1);

    // new coordinates cause a new fit
    rerender(<MapView days={buildDays([2, 2])} onSelectActivity={() => {}} />);
    expect(map.fitBounds).toHaveBeenCalledTimes(2);
  });
});

describe('Marker accessibility', () => {
  afterEach(() => {
    markers.length = 0;
  });

  it('sets each marker title', () => {
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
