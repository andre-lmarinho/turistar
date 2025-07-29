// src/tests/integration/mapRender.spec.tsx

import React from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import MapView from '@/app/planner/MapView';
import type { DayPlan } from '@/types';

const map = { fitBounds: vi.fn() };
const markers: Array<{ title?: string }> = [];
let containerProps: { center?: unknown } | undefined;

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
  containerProps = undefined;
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

  it('centers map using provided coordinates', () => {
    const days: DayPlan[] = [{ id: 'd1', label: 'Day 1', activities: [] }];
    render(<MapView days={days} onSelectActivity={() => {}} centerCoords={{ lat: 3, lng: 4 }} />);
    expect(containerProps.center).toEqual([3, 4]);
  });
});
