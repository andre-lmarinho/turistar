// tests/unit/features/planner/services/supabase/planDaysMapper.test.ts

import {
  mapPlanDaysFromSupabase,
  type SupabasePlanDayRow,
} from '@/features/planner/services/supabase/planDaysMapper';
import {
  DEFAULT_COLORS,
  DEFAULT_NEW_CARD_COLOR_INDEX,
} from '@/features/planner/domain/constants/colors';

const DEFAULT_COLOR = DEFAULT_COLORS[DEFAULT_NEW_CARD_COLOR_INDEX].bg;

describe('mapPlanDaysFromSupabase', () => {
  it('maps supabase rows to day plans with activity details', () => {
    const rows: SupabasePlanDayRow[] = [
      {
        date: '2024-07-05',
        activities: [
          {
            id: 'activity-1',
            day_id: 'day-1',
            title: 'Visit the museum',
            color: '#123456',
            address: '123 Museum Rd',
            category: 'culture',
            description: 'Explore art exhibits',
            start_time: '09:00',
            duration: 90,
            latitude: 51.5014,
            longitude: -0.1419,
            budget: 25,
            image_url: 'https://example.com/museum.jpg',
            position: 0,
          },
        ],
      },
    ];

    const result = mapPlanDaysFromSupabase(rows);

    expect(result).toEqual([
      {
        id: '2024-07-05',
        label: 'Fri, 05 Jul',
        activities: [
          {
            id: 'activity-1',
            title: 'Visit the museum',
            color: '#123456',
            position: '0',
            address: '123 Museum Rd',
            category: 'culture',
            description: 'Explore art exhibits',
            startTime: '09:00',
            duration: 90,
            latitude: 51.5014,
            longitude: -0.1419,
            budget: 25,
            imageUrl: 'https://example.com/museum.jpg',
          },
        ],
      },
    ]);
  });

  it('converts nullish values to safe defaults and handles empty activity lists', () => {
    const rows: SupabasePlanDayRow[] = [
      {
        date: '2024-07-06',
        activities: [
          {
            id: 'activity-2',
            day_id: 'day-2',
            title: null,
            color: null,
            address: null,
            category: null,
            description: null,
            start_time: null,
            duration: null,
            latitude: null,
            longitude: null,
            budget: null,
            image_url: null,
            position: 1,
          },
        ],
      },
      {
        date: '2024-07-07',
        activities: null,
      },
    ];

    const result = mapPlanDaysFromSupabase(rows);

    expect(result[0]).toEqual({
      id: '2024-07-06',
      label: 'Sat, 06 Jul',
      activities: [
        {
          id: 'activity-2',
          title: '',
          color: DEFAULT_COLOR,
          position: '1',
          address: undefined,
          category: undefined,
          description: undefined,
          startTime: undefined,
          duration: undefined,
          latitude: undefined,
          longitude: undefined,
          budget: undefined,
          imageUrl: undefined,
        },
      ],
    });

    expect(result[1]).toEqual({
      id: '2024-07-07',
      label: 'Sun, 07 Jul',
      activities: [],
    });
  });

  it('returns an empty array when no rows are provided', () => {
    expect(mapPlanDaysFromSupabase(null)).toEqual([]);
    expect(mapPlanDaysFromSupabase(undefined)).toEqual([]);
    expect(mapPlanDaysFromSupabase([])).toEqual([]);
  });
});
