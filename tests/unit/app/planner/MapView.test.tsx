import React from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { MapBoard } from '@/features/planner/components/map/MapBoard';
import { PlannerProvider } from '@/features/planner/hooks/PlannerContext';
import type { DayPlan } from '@/features/planner/domain/types/PlannerEntities';

// Reuse the same mocks across tests
const map = { fitBounds: vi.fn() };
const markers: Array<{ title?: string }> = [];
const polylines: Array<unknown> = [];
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
    Polyline: (props: unknown) => {
      polylines.push(props);
      return null;
    },
    useMap: () => map,
  };
});

vi.mock('@/features/planner/hooks/usePlanner', () => ({
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
}));

vi.mock('@/features/planner/hooks/useSelectedActivity', () => ({
  useSelectedActivity: () => ({
    selectedActivity: null,
    setSelectedActivity: vi.fn(),
    changeDay: vi.fn(),
    changePosition: vi.fn(),
    addBlankAndSelect: vi.fn(),
    closeDialog: vi.fn(),
    save: vi.fn(),
    deleteActivity: vi.fn(),
    changeColor: vi.fn(),
  }),
}));

// Simplify Leaflet utilities
vi.mock('leaflet', () => ({
  __esModule: true,
  default: {
    divIcon: () => ({}),
    latLngBounds: vi.fn(() => ({})),
  },
}));

describe.skip('FitAllMarkers effect', () => {
  afterEach(() => {
    map.fitBounds.mockClear();
    markers.length = 0;
    polylines.length = 0;
    containerProps = undefined;
    mockDestCoords = null;
  });

  const baseActivity = { id: 'a1', title: 'A1', color: 'bg-[var(--color-1)]' };

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
      <PlannerProvider planId="p1">
        <MapBoard />
      </PlannerProvider>
    );
    expect(map.fitBounds).toHaveBeenCalledTimes(1);

    rerender(
      <PlannerProvider planId="p1">
        <MapBoard />
      </PlannerProvider>
    );
    expect(map.fitBounds).toHaveBeenCalledTimes(1);

    mockDays = buildDays([2, 2]);
    rerender(
      <PlannerProvider planId="p1">
        <MapBoard />
      </PlannerProvider>
    );
    expect(map.fitBounds).toHaveBeenCalledTimes(2);
  });
});

describe.skip('Marker accessibility', () => {
  afterEach(() => {
    markers.length = 0;
    polylines.length = 0;
    containerProps = undefined;
    mockDestCoords = null;
  });

  it('sets each marker title', () => {
    const days: DayPlan[] = [
      {
        id: 'd1',
        label: 'Day 1',
        activities: [
          { id: 'a1', title: 'Walk', color: 'bg-[var(--color-1)]', latitude: 1, longitude: 1 },
        ],
      },
    ];

    mockDays = days;
    render(
      <PlannerProvider planId="p1">
        <MapBoard />
      </PlannerProvider>
    );
    expect(markers[0].title).toBe('Walk');
  });

  it('does not render a path for multiple activities', () => {
    const days: DayPlan[] = [
      {
        id: 'd1',
        label: 'Day 1',
        activities: [
          { id: 'a1', title: 'A1', color: 'bg-[var(--color-1)]', latitude: 1, longitude: 1 },
          { id: 'a2', title: 'A2', color: 'bg-[var(--color-1)]', latitude: 2, longitude: 2 },
        ],
      },
    ];
    mockDays = days;
    render(
      <PlannerProvider planId="p1">
        <MapBoard />
      </PlannerProvider>
    );
    expect(polylines.length).toBe(0);
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
      <PlannerProvider planId="p1">
        <MapBoard />
      </PlannerProvider>
    );
    expect(containerProps!.center).toEqual([5, 6]);
  });
});
