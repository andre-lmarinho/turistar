// src/app/planner/MapView.test.tsx

import React from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import MapView from './MapView';
import type { DayPlan } from '@/types';

let mockCtx: {
  days: DayPlan[];
  setSelectedActivity: () => void;
  destCoords?: { lat: number; lng: number };
};
vi.mock('@/contexts/PlannerContext', () => ({
  usePlannerContext: () => mockCtx,
}));

// Reuse the same mocks across tests
const map = { fitBounds: vi.fn() };
const markers: Array<{ title?: string }> = [];
let containerProps: { center?: unknown } | undefined;

// Stub react-leaflet
vi.mock('react-leaflet', () => {
  const React = require('react');
  return {
    MapContainer: (props: { children: React.ReactNode; center?: unknown }) => {
      containerProps = props;
      return <div>{props.children}</div>;
    },
    TileLayer: () => null,
    Marker: (props: { title?: string }) => {
      markers.push(props);
      return null;
    },
    Polyline: () => null,
    useMap: () => map,
  };
});

// Simplify Leaflet utilities
vi.mock('leaflet', () => ({
  __esModule: true,
  default: {
    divIcon: () => ({}),
    latLngBounds: vi.fn(() => ({})),
  },
}));

const baseActivity = { id: 'a1', title: 'A1', color: 'red' };

const buildDays = ([lat, lng]: [number, number]): DayPlan[] => [
  {
    id: 'd1',
    label: 'Day 1',
    activities: [{ ...baseActivity, latitude: lat, longitude: lng }],
  },
];

const renderMap = (days: DayPlan[], dest?: { lat: number; lng: number }) => {
  mockCtx = { days, setSelectedActivity: vi.fn(), destCoords: dest };
  return render(<MapView />);
};

describe('FitAllMarkers effect', () => {
  afterEach(() => {
    map.fitBounds.mockClear();
    markers.length = 0;
    containerProps = undefined;
  });

  it('runs when coordinates change', () => {
    const { rerender } = renderMap(buildDays([1, 1]));
    expect(map.fitBounds).toHaveBeenCalledTimes(1);

    mockCtx.days = buildDays([1, 1]);
    rerender(<MapView />);
    expect(map.fitBounds).toHaveBeenCalledTimes(1);

    mockCtx.days = buildDays([2, 2]);
    rerender(<MapView />);
    expect(map.fitBounds).toHaveBeenCalledTimes(2);
  });
});

describe('Marker accessibility', () => {
  afterEach(() => {
    markers.length = 0;
    containerProps = undefined;
  });

  it('sets each marker title', () => {
    const days: DayPlan[] = [
      {
        id: 'd1',
        label: 'Day 1',
        activities: [{ id: 'a1', title: 'Walk', color: 'red', latitude: 1, longitude: 1 }],
      },
    ];

    renderMap(days);
    expect(markers[0].title).toBe('Walk');
  });

  it('uses provided center coordinates when no activities', () => {
    const days: DayPlan[] = [
      {
        id: 'd1',
        label: 'Day 1',
        activities: [],
      },
    ];

    renderMap(days, { lat: 5, lng: 6 });
    expect(containerProps!.center).toEqual([5, 6]);
  });
});
