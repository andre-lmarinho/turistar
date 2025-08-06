// src/utils/syncDaysWithTripRange.test.ts

import { formatDayPlan, syncDaysWithTripRange } from '@/features/planner/services';
import { parseISO } from 'date-fns';
import type { DayPlan, Activity } from '@/shared/types';

function buildActivity(id: string): Activity {
  return { id, title: id.toUpperCase(), color: 'red' };
}

describe('syncDaysWithTripRange immutability', () => {
  it('does not mutate original days when shortening the trip', () => {
    const a1 = buildActivity('a1');
    const b1 = buildActivity('b1');
    const c1 = buildActivity('c1');

    const days: DayPlan[] = [
      { id: '2023-01-01', label: 'Day 1', activities: [a1] },
      { id: '2023-01-02', label: 'Day 2', activities: [b1] },
      { id: '2023-01-03', label: 'Day 3', activities: [c1] },
    ];
    const snapshot = JSON.parse(JSON.stringify(days));
    const trip = [new Date('2023-01-01'), new Date('2023-01-02')];

    const result = syncDaysWithTripRange(days, trip);

    expect(days).toEqual(snapshot);
    expect(result).toHaveLength(2);
    expect(result[1].activities.map((a) => a.id)).toEqual(['b1', 'c1']);
  });

  it('handles empty trip days', () => {
    const days: DayPlan[] = [{ id: 'd1', label: 'Day 1', activities: [buildActivity('a1')] }];
    const result = syncDaysWithTripRange(days, []);
    expect(result).toEqual([]);
  });

  it('does not mutate original days when extending the trip', () => {
    const a1 = buildActivity('a1');
    const b1 = buildActivity('b1');

    const days: DayPlan[] = [
      { id: 'd1', label: 'Day 1', activities: [a1] },
      { id: 'd2', label: 'Day 2', activities: [b1] },
    ];
    const snapshot = JSON.parse(JSON.stringify(days));
    const trip = [new Date('2023-01-01'), new Date('2023-01-02'), new Date('2023-01-03')];

    const result = syncDaysWithTripRange(days, trip);

    expect(days).toEqual(snapshot);
    expect(result).toHaveLength(3);
    expect(result[2].activities).toEqual([]);
  });
});

describe('syncDaysWithTripRange relabeling', () => {
  it('updates ids and labels to match the new trip days while keeping activities', () => {
    const a1 = buildActivity('a1');
    const b1 = buildActivity('b1');

    const initialTrip = [parseISO('2023-01-01T00:00:00Z'), parseISO('2023-01-02T00:00:00Z')];
    const days: DayPlan[] = [
      { ...formatDayPlan(initialTrip[0]), activities: [a1] },
      { ...formatDayPlan(initialTrip[1]), activities: [b1] },
    ];

    const newTrip = [parseISO('2023-02-01T00:00:00Z'), parseISO('2023-02-02T00:00:00Z')];

    const result = syncDaysWithTripRange(days, newTrip);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: '2023-02-01',
      label: 'Wed, 01 Feb',
    });
    expect(result[0].activities.map((a) => a.id)).toEqual(['a1']);

    expect(result[1]).toMatchObject({
      id: '2023-02-02',
      label: 'Thu, 02 Feb',
    });
    expect(result[1].activities.map((a) => a.id)).toEqual(['b1']);
  });

  it('adds new day at the start when trip extends earlier', () => {
    const a1 = buildActivity('a1');
    const b1 = buildActivity('b1');

    const current: DayPlan[] = [
      { ...formatDayPlan(parseISO('2023-01-02')), activities: [a1] },
      { ...formatDayPlan(parseISO('2023-01-03')), activities: [b1] },
    ];

    const trip = [
      parseISO('2023-01-01T00:00:00Z'),
      parseISO('2023-01-02T00:00:00Z'),
      parseISO('2023-01-03T00:00:00Z'),
    ];

    const result = syncDaysWithTripRange(current, trip);

    expect(result).toHaveLength(3);
    expect(result[0]).toMatchObject({ id: '2023-01-01', activities: [] });
    expect(result[1].activities.map((a) => a.id)).toEqual(['a1']);
    expect(result[2].activities.map((a) => a.id)).toEqual(['b1']);
  });

  it('moves activities from removed start days to the new first day', () => {
    const a1 = buildActivity('a1');
    const b1 = buildActivity('b1');
    const c1 = buildActivity('c1');

    const current: DayPlan[] = [
      { ...formatDayPlan(parseISO('2023-01-01')), activities: [a1] },
      { ...formatDayPlan(parseISO('2023-01-02')), activities: [b1] },
      { ...formatDayPlan(parseISO('2023-01-03')), activities: [c1] },
    ];

    const trip = [parseISO('2023-01-02T00:00:00Z'), parseISO('2023-01-03T00:00:00Z')];

    const result = syncDaysWithTripRange(current, trip);

    expect(result).toHaveLength(2);
    expect(result[0].activities.map((a) => a.id)).toEqual(['a1', 'b1']);
    expect(result[1].activities.map((a) => a.id)).toEqual(['c1']);
  });
});
