// tests/integration/planner/mapRender.spec.tsx

import React from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import MapView from '@/app/planner/MapView';
import { PlannerProvider } from '@/features/planner/hooks/PlannerContext';
import type { DayPlan } from '@/shared/types';

const map = { fitBounds: vi.fn() };
const markers: Array<{
  title?: string;
  eventHandlers?: Record<string, (...args: unknown[]) => void>;
}> = [];
const setSelectedActivity = vi.hoisted(() => vi.fn());
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
    Marker: (props: {
      title?: string;
      eventHandlers?: Record<string, (...args: unknown[]) => void>;
    }) => {
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

vi.mock('@/features/planner/hooks/PlannerContext', () => ({
  __esModule: true,
  PlannerProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  usePlannerContext: () => ({
    planId: 'p1',
    dest: 'rome',
    days: mockDays,
    destCoords: mockDestCoords,
    setSelectedActivity,
    setDays: vi.fn(),
    sensors: undefined,
    collisionDetection: vi.fn(),
    handleDragStart: vi.fn(),
    handleDragOver: vi.fn(),
    handleDragEnd: vi.fn(),
    addBlankAndSelect: vi.fn(),
    changeDay: vi.fn(),
    changePosition: vi.fn(),
    changeColor: vi.fn(),
    removeActivity: vi.fn(),
    updateActivity: vi.fn(),
    selectedActivity: null,
    currentRange: undefined,
    handleRangeChange: vi.fn(),
  }),
}));

function renderMapView(days: DayPlan[], destCoords: { lat: number; lng: number } | null = null) {
  mockDays = days;
  mockDestCoords = destCoords;
  return render(
    <PlannerProvider planId="p1">
      <MapView />
    </PlannerProvider>
  );
}

beforeEach(() => {
  map.fitBounds.mockClear();
  markers.length = 0;
  containerProps = undefined;
  mockDays = [];
  mockDestCoords = null;
  setSelectedActivity.mockClear();
});

describe('map render integration', () => {
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
    renderMapView(days);
    expect(markers[0].title).toBe('Walk');
  });

  it('centers map using provided coordinates', () => {
    const days: DayPlan[] = [{ id: 'd1', label: 'Day 1', activities: [] }];
    renderMapView(days, { lat: 3, lng: 4 });
    expect(containerProps!.center).toEqual([3, 4]);
  });

  it('selects activity when marker clicked', () => {
    const days: DayPlan[] = [
      {
        id: 'd1',
        label: 'Day 1',
        activities: [
          { id: 'a1', title: 'Walk', color: 'bg-[var(--color-1)]', latitude: 1, longitude: 1 },
        ],
      },
    ];
    renderMapView(days);
    markers[0].eventHandlers?.click?.();
    expect(setSelectedActivity).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'a1', dayId: 'd1' })
    );
  });

  it('handles activities missing coordinates', () => {
    const days: DayPlan[] = [
      {
        id: 'd1',
        label: 'Day 1',
        activities: [{ id: 'a1', title: 'Walk', color: 'bg-[var(--color-1)]' }],
      },
    ];
    renderMapView(days);
    expect(markers.length).toBe(0);
    expect(map.fitBounds).not.toHaveBeenCalled();
  });

  it('updates map bounds when days change', () => {
    const buildDays = (lat: number, lng: number): DayPlan[] => [
      {
        id: 'd1',
        label: 'Day 1',
        activities: [
          { id: 'a1', title: 'A1', color: 'bg-[var(--color-1)]', latitude: lat, longitude: lng },
        ],
      },
    ];
    renderMapView(buildDays(1, 1));
    expect(map.fitBounds).toHaveBeenCalledTimes(1);
    map.fitBounds.mockClear();
    renderMapView(buildDays(2, 2));
    expect(map.fitBounds).toHaveBeenCalledTimes(1);
  });

  it('selects activity on marker context menu', () => {
    const days: DayPlan[] = [
      {
        id: 'd1',
        label: 'Day 1',
        activities: [
          { id: 'a1', title: 'Walk', color: 'bg-[var(--color-1)]', latitude: 1, longitude: 1 },
        ],
      },
    ];
    renderMapView(days);
    const preventDefault = vi.fn();
    markers[0].eventHandlers?.contextmenu?.({
      originalEvent: { preventDefault },
    } as unknown as { originalEvent: { preventDefault: () => void } });
    expect(preventDefault).toHaveBeenCalled();
    expect(setSelectedActivity).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'a1', dayId: 'd1' })
    );
  });

  it('falls back to default center when no coordinates provided', () => {
    renderMapView([]);
    expect(containerProps!.center).toEqual([0, 0]);
    expect(map.fitBounds).not.toHaveBeenCalled();
  });

  it('adds markers when days update dynamically', () => {
    const buildDays = (title: string, lat: number, lng: number): DayPlan[] => [
      {
        id: 'd1',
        label: 'Day 1',
        activities: [
          { id: 'a1', title, color: 'bg-[var(--color-1)]', latitude: lat, longitude: lng },
        ],
      },
    ];
    renderMapView(buildDays('A1', 1, 1));
    expect(markers).toHaveLength(1);
    renderMapView(buildDays('A2', 2, 2));
    expect(markers).toHaveLength(2);
    expect(markers[1].title).toBe('A2');
  });
});
