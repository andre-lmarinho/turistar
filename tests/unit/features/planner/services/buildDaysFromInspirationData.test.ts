import { buildDaysFromInspirationData } from '@/features/planner/services/days/buildDaysFromInspirationData';
import type { Activity } from '@/features/planner/domain/types/PlannerEntities';

const sample = {
  destination: 'Test',
  itinerary: [
    {
      day: 1,
      activities: [
        {
          title: 'Visit Museum',
          startTime: '09:00',
          duration: 2,
          address: 'Street 1',
          latitude: 1,
          longitude: 2,
        },
      ],
    },
  ],
};

describe('buildDaysFromInspirationData', () => {
  it('creates day plans from raw data', () => {
    const result = buildDaysFromInspirationData(sample);
    expect(result).toHaveLength(1);
    const day = result[0];
    expect(day.activities).toHaveLength(1);
    const act = day.activities[0] as Activity;
    expect(act.title).toBe('Visit Museum');
    expect(act.startTime).toBe('09:00');
    expect(act.latitude).toBe(1);
    expect(act.longitude).toBe(2);
  });
});
