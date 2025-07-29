// src/utils/buildDaysFromInspirationData.test.ts

import { buildDaysFromInspirationData } from '@/utils/buildDaysFromInspirationData';
import type { Activity, DayPlan } from '@/types';

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
  });
});
