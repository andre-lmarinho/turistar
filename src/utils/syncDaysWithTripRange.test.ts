import { syncDaysWithTripRange } from './syncDaysWithTripRange';
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
