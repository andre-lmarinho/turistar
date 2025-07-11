import { syncDaysWithTripRange } from './syncDaysWithTripRange';
import { formatDayPlan } from './formatDayPlan';
import type { DayPlan, Activity } from '@/types/itinerary';

function buildActivity(id: string): Activity {
  return { id, title: id.toUpperCase(), color: 'red' };
}

describe('syncDaysWithTripRange immutability', () => {
  it('does not mutate original days when shortening the trip', () => {
    const a1 = buildActivity('a1');
    const b1 = buildActivity('b1');
    const c1 = buildActivity('c1');

    const days: DayPlan[] = [
      { id: 'd1', label: 'Day 1', activities: [a1] },
      { id: 'd2', label: 'Day 2', activities: [b1] },
      { id: 'd3', label: 'Day 3', activities: [c1] },
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

    const initialTrip = [new Date('2023-01-01'), new Date('2023-01-02')];
    const days: DayPlan[] = [
      { ...formatDayPlan(initialTrip[0]), activities: [a1] },
      { ...formatDayPlan(initialTrip[1]), activities: [b1] },
    ];

    const newTrip = [new Date('2023-02-01'), new Date('2023-02-02')];

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
});
