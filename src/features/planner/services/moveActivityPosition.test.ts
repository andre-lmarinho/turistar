// src/utils/moveActivityPosition.test.ts

import { moveActivityPosition } from '@/features/planner/services/moveActivityPosition';
import type { DayPlan, Activity } from '@/shared/types';

function build(id: string): Activity {
  return { id, title: id.toUpperCase(), color: 'red' };
}

describe('moveActivityPosition', () => {
  it('reorders activity within the same day without mutating input', () => {
    const a1 = build('a1');
    const a2 = build('a2');
    const a3 = build('a3');
    const days: DayPlan[] = [{ id: 'd1', label: 'Day 1', activities: [a1, a2, a3] }];
    const snapshot = JSON.parse(JSON.stringify(days));

    const result = moveActivityPosition(days, 'a1', 2);

    expect(days).toEqual(snapshot);
    expect(result[0].activities.map((a) => a.id)).toEqual(['a2', 'a3', 'a1']);
  });
});
