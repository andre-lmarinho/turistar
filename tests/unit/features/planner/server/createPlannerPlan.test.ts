import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/features/app/planner/server/actions/plans/createPlan', () => ({
  createPlan: vi.fn(),
}));

vi.mock('@/shared/lib/auth/session', () => ({
  getCurrentUser: vi.fn(),
}));

import { createPlannerPlan } from '@/features/app/planner/server/actions/plans/createPlannerPlan';
import { createPlan } from '@/features/app/planner/server/actions/plans/createPlan';
import { getCurrentUser } from '@/shared/lib/auth/session';

describe('createPlannerPlan', () => {
  beforeEach(() => {
    vi.mocked(createPlan).mockReset();
    vi.mocked(getCurrentUser).mockReset();
  });

  it('maps the action result into the marketing payload', async () => {
    vi.mocked(createPlan).mockResolvedValue({
      id: 'plan-42',
      publicSlug: 'trip-42',
      editToken: 'edit-42',
    });

    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const result = await createPlannerPlan({
      title: 'Weekend Trip',
      destination: { name: 'Berlin', latitude: 52.52, longitude: 13.405 },
      startDate: '2024-04-01',
      endDate: '2024-04-03',
    });

    expect(createPlan).toHaveBeenCalledWith(
      'Weekend Trip',
      { name: 'Berlin', latitude: 52.52, longitude: 13.405, country: undefined },
      '2024-04-01',
      '2024-04-03',
      undefined
    );

    expect(result).toEqual({
      planId: 'plan-42',
      publicSlug: 'trip-42',
      editToken: 'edit-42',
      recentPlan: {
        id: 'plan-42',
        slug: 'trip-42',
        dest: 'Berlin',
        start: '2024-04-01',
        end: '2024-04-03',
      },
    });
  });
});
