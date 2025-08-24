// tests/integration/planner/mapRender.spec.tsx

import React from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import MapView from '@/app/planner/MapView';
import { PlannerProvider } from '@/features/planner';
import type { DayPlan } from '@/shared/types';

const map = { fitBounds: vi.fn() };
const markers: Array<{ title?: string }> = [];
let containerProps: { center?: unknown } | undefined;
let mockDays: DayPlan[] = [];
let mockDestCoords: { lat: number; lng: number } | null = null;

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

vi.mock('@/features/planner/hooks/usePlanParams', () => ({
  usePlanParams: () => ({ dest: 'rome', destCoords: mockDestCoords }),
}));

vi.mock('@/features/planner', async () => {
  const actual = await vi.importActual<typeof import('@/features/planner')>('@/features/planner');
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
    usePlanParams: () => ({ dest: 'rome', destCoords: mockDestCoords }),
  };
});

afterEach(() => {
  map.fitBounds.mockClear();
  markers.length = 0;
  containerProps = undefined;
  mockDays = [];
  mockDestCoords = null;
});

describe.skip('map render integration', () => {
  it('renders markers for activities', () => {
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
        <MapView />
      </PlannerProvider>
    );
    expect(markers[0].title).toBe('Walk');
  });

  it('centers map using provided coordinates', () => {
    const days: DayPlan[] = [{ id: 'd1', label: 'Day 1', activities: [] }];
    mockDays = days;
    mockDestCoords = { lat: 3, lng: 4 };
    render(
      <PlannerProvider planId="p1">
        <MapView />
      </PlannerProvider>
    );
    expect(containerProps!.center).toEqual([3, 4]);
  });
});
