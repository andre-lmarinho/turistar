// src/app/planner/MapView.test.tsx

import React from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import MapView from './MapView';
import { PlannerProvider } from '@/contexts';
import type { DayPlan } from '@/types';

// Reuse the same mocks across tests
const map = { fitBounds: vi.fn() };
const markers: Array<{ title?: string }> = [];
let containerProps: { center?: unknown } | undefined;

let mockDays: DayPlan[] = [];
let mockDestCoords: { lat: number; lng: number } | null = null;

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

vi.mock('@/hooks', async () => {
  const actual = await vi.importActual<typeof import('@/hooks')>('@/hooks');
  return {
    ...actual,
    usePlanner: () => ({
      planId: 'p1',
      dest: 'rome',
      days: mockDays,
      destCoords: mockDestCoords,
      setDays: vi.fn(),
      currentRange: undefined,
      handleRangeChange: vi.fn(),
      activeId: null,
      sensors: [],
      collisionDetection: vi.fn(),
      handleDragStart: vi.fn(),
      handleDragOver: vi.fn(),
      handleDragEnd: vi.fn(),
      addActivity: vi.fn(),
      removeActivity: vi.fn(),
      updateActivity: vi.fn(),
      addBlankActivity: vi.fn(),
    }),
    useSelectedActivity: () => ({
      selectedActivity: null,
      setSelectedActivity: vi.fn(),
      changeDay: vi.fn(),
      changePosition: vi.fn(),
      addBlankAndSelect: vi.fn(),
      closeModal: vi.fn(),
      save: vi.fn(),
      deleteActivity: vi.fn(),
      changeColor: vi.fn(),
    }),
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

describe('FitAllMarkers effect', () => {
  afterEach(() => {
    map.fitBounds.mockClear();
    markers.length = 0;
    containerProps = undefined;
    mockDestCoords = null;
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
    mockDays = buildDays([1, 1]);
    const { rerender } = render(
      <PlannerProvider>
        <MapView />
      </PlannerProvider>
    );
    expect(map.fitBounds).toHaveBeenCalledTimes(1);

    rerender(
      <PlannerProvider>
        <MapView />
      </PlannerProvider>
    );
    expect(map.fitBounds).toHaveBeenCalledTimes(1);

    mockDays = buildDays([2, 2]);
    rerender(
      <PlannerProvider>
        <MapView />
      </PlannerProvider>
    );
    expect(map.fitBounds).toHaveBeenCalledTimes(2);
  });
});

describe('Marker accessibility', () => {
  afterEach(() => {
    markers.length = 0;
    containerProps = undefined;
    mockDestCoords = null;
  });

  it('sets each marker title', () => {
    const days: DayPlan[] = [
      {
        id: 'd1',
        label: 'Day 1',
        activities: [{ id: 'a1', title: 'Walk', color: 'red', latitude: 1, longitude: 1 }],
      },
    ];

    mockDays = days;
    render(
      <PlannerProvider>
        <MapView />
      </PlannerProvider>
    );
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
    mockDays = days;
    mockDestCoords = { lat: 5, lng: 6 };
    render(
      <PlannerProvider>
        <MapView />
      </PlannerProvider>
    );
    expect(containerProps!.center).toEqual([5, 6]);
  });
});
