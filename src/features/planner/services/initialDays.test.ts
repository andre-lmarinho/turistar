// src/utils/initialDays.test.ts

import { buildInitialDays } from '@/features/planner/services/initialDays';
import { parseISO } from 'date-fns';

describe('buildInitialDays', () => {
  it('builds day plans with empty activities', () => {
    const dates = [parseISO('2024-07-05T00:00:00Z'), parseISO('2024-07-06T00:00:00Z')];

    const result = buildInitialDays(dates);

    expect(result).toEqual([
      { id: '2024-07-05', label: 'Fri, 05 Jul', activities: [] },
      { id: '2024-07-06', label: 'Sat, 06 Jul', activities: [] },
    ]);
  });
});
