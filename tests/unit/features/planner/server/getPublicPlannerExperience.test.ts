import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

vi.mock('@/features/app/planner/server/repositories/PlanRepository', () => ({
  fetchPlanBudgetEntries: vi.fn(),
  fetchPlanMemberTier: vi.fn(),
  fetchPublicPlanBySlug: vi.fn(),
  fetchLatestPlanSnapshot: vi.fn(),
}));

import { notFound } from 'next/navigation';
import { getPublicPlannerExperience } from '@/features/app/planner/server/queries/plans/getPublicPlannerExperience';
import {
  fetchPlanBudgetEntries,
  fetchPlanMemberTier,
  fetchPublicPlanBySlug,
  fetchLatestPlanSnapshot,
} from '@/features/app/planner/server/repositories/PlanRepository';
import type {
  BudgetEntryRecord,
  PlanRecord,
  PlanSnapshotRecord,
} from '@/features/app/planner/server/repositories/PlanRepository';

const notFoundError = new Error('NOT_FOUND');

describe('getPublicPlannerExperience', () => {
  beforeEach(() => {
    vi.mocked(notFound).mockImplementation(() => {
      throw notFoundError;
    });
    vi.mocked(notFound).mockClear();
    vi.mocked(fetchPlanBudgetEntries).mockReset();
    vi.mocked(fetchPlanMemberTier).mockReset();
    vi.mocked(fetchPublicPlanBySlug).mockReset();
    vi.mocked(fetchLatestPlanSnapshot).mockReset();
  });

  it('returns the planner experience with mapped days and fallback destination', async () => {
    const plan: PlanRecord = {
      id: 'plan-1',
      title: 'Summer Escape',
      ownerId: 'owner-1',
      editToken: 'token-123',
      budget: 1500,
      startDate: null,
      endDate: null,
      destinations: [{ name: 'Paris' }],
    };

    const snapshotRow: PlanSnapshotRecord = {
      plan_id: 'plan-1',
      version: 1,
      state: {
        days: [
          {
            id: '2024-01-01',
            label: 'Mon, 01 Jan',
            activities: [
              {
                id: 'activity-1',
                title: 'Visit Louvre',
                color: '#123456',
                address: 'Paris, France',
                category: 'Culture',
                description: 'Explore the museum',
                startTime: '09:00',
                duration: 120,
                latitude: 48.8606,
                longitude: 2.3376,
                budget: 50,
                imageUrl: null,
              },
            ],
          },
        ],
      },
      updated_at: '2024-01-01T00:00:00.000Z',
    };

    const entryRows: BudgetEntryRecord[] = [
      { id: 'entry-1', description: 'Flight', category: 'travel', amount: 900 },
    ];

    vi.mocked(fetchPublicPlanBySlug).mockResolvedValue(plan);
    vi.mocked(fetchLatestPlanSnapshot).mockResolvedValue(snapshotRow);
    vi.mocked(fetchPlanBudgetEntries).mockResolvedValue(entryRows);

    const experience = await getPublicPlannerExperience({ slug: 'summer-escape' });

    expect(notFound).not.toHaveBeenCalled();
    expect(experience).toEqual({
      planId: 'plan-1',
      title: 'Summer Escape',
      destination: 'Paris',
      initialDays: [
        {
          id: '2024-01-01',
          label: 'Mon, 01 Jan',
          position: '1024',
          activities: [
            expect.objectContaining({
              id: 'activity-1',
              title: 'Visit Louvre',
              color: '#123456',
              address: 'Paris, France',
              category: 'Culture',
              description: 'Explore the museum',
              startTime: '09:00',
              duration: 120,
              latitude: 48.8606,
              longitude: 2.3376,
              budget: 50,
            }),
          ],
        },
      ],
      initialBudget: 1500,
      initialEntries: [
        {
          id: 'entry-1',
          description: 'Flight',
          category: 'travel',
          amount: 900,
        },
      ],
      canEdit: false,
      editToken: undefined,
      isOwner: false,
      isAdmin: false,
      canManageMembers: false,
    });
  });

  it('calls notFound when the plan is missing', async () => {
    vi.mocked(fetchPublicPlanBySlug).mockResolvedValueOnce(null);

    await expect(getPublicPlannerExperience({ slug: 'no-plan' })).rejects.toBe(notFoundError);

    expect(notFound).toHaveBeenCalledTimes(1);
  });

  it('propagates repository errors when fetching the plan', async () => {
    const failure = new Error('plan missing');
    vi.mocked(fetchPublicPlanBySlug).mockRejectedValueOnce(failure);

    await expect(getPublicPlannerExperience({ slug: 'no-plan' })).rejects.toBe(failure);

    expect(notFound).not.toHaveBeenCalled();
  });

  it('returns a fallback destination when no destination is available', async () => {
    const plan: PlanRecord = {
      id: 'plan-2',
      title: 'Untitled',
      ownerId: null,
      editToken: 'token-2',
      budget: null,
      startDate: null,
      endDate: null,
      destinations: [],
    };
    vi.mocked(fetchPublicPlanBySlug).mockResolvedValue(plan);
    vi.mocked(fetchLatestPlanSnapshot).mockResolvedValue(null);
    vi.mocked(fetchPlanBudgetEntries).mockResolvedValue(null);

    const experience = await getPublicPlannerExperience({ slug: 'missing-dest' });

    expect(notFound).not.toHaveBeenCalled();
    expect(experience).toEqual({
      planId: 'plan-2',
      title: 'Untitled',
      destination: 'Destination TBD',
      initialDays: undefined,
      initialBudget: undefined,
      initialEntries: undefined,
      canEdit: false,
      editToken: undefined,
      isOwner: false,
      isAdmin: false,
      canManageMembers: false,
    });
  });

  it('propagates snapshot errors', async () => {
    const plan: PlanRecord = {
      id: 'plan-3',
      title: null,
      ownerId: 'owner-3',
      editToken: 'token-3',
      budget: null,
      startDate: null,
      endDate: null,
      destinations: [{ name: 'Lisbon' }],
    };
    vi.mocked(fetchPublicPlanBySlug).mockResolvedValue(plan);
    const snapshotError = new Error('snapshot failure');
    vi.mocked(fetchLatestPlanSnapshot).mockRejectedValue(snapshotError);
    vi.mocked(fetchPlanBudgetEntries).mockResolvedValue(null);

    await expect(
      getPublicPlannerExperience({ slug: 'lisbon-plan', dest: 'Lisbon' })
    ).rejects.toBe(snapshotError);

    expect(notFound).not.toHaveBeenCalled();
  });

  it('propagates budget entry errors', async () => {
    const plan: PlanRecord = {
      id: 'plan-4',
      title: null,
      ownerId: 'owner-4',
      editToken: 'token-4',
      budget: null,
      startDate: null,
      endDate: null,
      destinations: [{ name: 'Lisbon' }],
    };
    const entryError = new Error('budget entries failure');
    vi.mocked(fetchPublicPlanBySlug).mockResolvedValue(plan);
    vi.mocked(fetchLatestPlanSnapshot).mockResolvedValue(null);
    vi.mocked(fetchPlanBudgetEntries).mockRejectedValue(entryError);

    await expect(
      getPublicPlannerExperience({ slug: 'lisbon-plan', dest: 'Lisbon' })
    ).rejects.toBe(entryError);

    expect(notFound).not.toHaveBeenCalled();
  });
});
