import { describe, it, expect, beforeEach, vi } from 'vitest';
import { notFound } from 'next/navigation';

import { getUserPlannerExperience } from '@/features/app/planner/server/queries/plans/getUserPlannerExperience';
import {
  fetchPlanBudgetEntries,
  fetchPlanByIdWithMembers,
  fetchLatestPlanSnapshot,
} from '@/features/app/planner/server/repositories/PlanRepository';
import type {
  BudgetEntryRecord,
  PlanSnapshotRecord,
  PlanWithMembersRecord,
} from '@/features/app/planner/server/repositories/PlanRepository';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

vi.mock('@/features/app/planner/server/repositories/PlanRepository', () => ({
  fetchPlanBudgetEntries: vi.fn(),
  fetchPlanByIdWithMembers: vi.fn(),
  fetchLatestPlanSnapshot: vi.fn(),
}));

const notFoundError = new Error('NOT_FOUND');

describe('getUserPlannerExperience', () => {
  beforeEach(() => {
    vi.mocked(notFound).mockImplementation(() => {
      throw notFoundError;
    });
    vi.mocked(fetchPlanByIdWithMembers).mockReset();
    vi.mocked(fetchLatestPlanSnapshot).mockReset();
    vi.mocked(fetchPlanBudgetEntries).mockReset();
  });

  it('calls notFound when the plan user id does not match', async () => {
    const plan: PlanWithMembersRecord = {
      id: 'plan-1',
      title: 'Trip',
      ownerId: 'owner',
      editToken: 'token',
      budget: 100,
      startDate: null,
      endDate: null,
      destinations: [{ name: 'Berlin' }],
      members: [],
    };
    vi.mocked(fetchPlanByIdWithMembers).mockResolvedValue(plan);

    await expect(getUserPlannerExperience('plan-1', 'user-1')).rejects.toBe(notFoundError);

    expect(notFound).toHaveBeenCalled();
    expect(fetchLatestPlanSnapshot).not.toHaveBeenCalled();
    expect(fetchPlanBudgetEntries).not.toHaveBeenCalled();
  });

  it('calls notFound when there is no destination', async () => {
    const plan: PlanWithMembersRecord = {
      id: 'plan-2',
      title: 'Plan',
      ownerId: 'user-2',
      editToken: 'token',
      budget: 50,
      startDate: null,
      endDate: null,
      destinations: [{ name: null }],
      members: [],
    };
    vi.mocked(fetchPlanByIdWithMembers).mockResolvedValue(plan);

    await expect(getUserPlannerExperience('plan-2', 'user-2')).rejects.toBe(notFoundError);

    expect(notFound).toHaveBeenCalled();
    expect(fetchLatestPlanSnapshot).not.toHaveBeenCalled();
    expect(fetchPlanBudgetEntries).not.toHaveBeenCalled();
  });

  it('throws when the snapshot query fails', async () => {
    const plan: PlanWithMembersRecord = {
      id: 'plan-3',
      title: null,
      ownerId: 'user-3',
      editToken: 'token',
      budget: null,
      startDate: null,
      endDate: null,
      destinations: [{ name: 'Rome' }],
      members: [],
    };
    const snapshotErr = new Error('snapshot fail');
    vi.mocked(fetchPlanByIdWithMembers).mockResolvedValue(plan);
    vi.mocked(fetchLatestPlanSnapshot).mockRejectedValue(snapshotErr);

    await expect(getUserPlannerExperience('plan-3', 'user-3')).rejects.toBe(snapshotErr);
    expect(fetchPlanBudgetEntries).not.toHaveBeenCalled();
  });

  it('throws when the entry query fails', async () => {
    const plan: PlanWithMembersRecord = {
      id: 'plan-4',
      title: 'Road trip',
      ownerId: 'user-4',
      editToken: 'token',
      budget: 200,
      startDate: null,
      endDate: null,
      destinations: [{ name: 'Lisbon' }],
      members: [],
    };
    const entryErr = new Error('entry fail');
    vi.mocked(fetchPlanByIdWithMembers).mockResolvedValue(plan);
    vi.mocked(fetchLatestPlanSnapshot).mockResolvedValue(null);
    vi.mocked(fetchPlanBudgetEntries).mockRejectedValue(entryErr);

    await expect(getUserPlannerExperience('plan-4', 'user-4')).rejects.toBe(entryErr);
  });

  it('returns mapped experience with normalized entries', async () => {
    const plan: PlanWithMembersRecord = {
      id: 'plan-5',
      title: 'Adventure',
      ownerId: 'user-5',
      editToken: 'token',
      budget: 666,
      startDate: null,
      endDate: null,
      destinations: [{ name: 'Madrid' }],
      members: [],
    };
    const snapshotRow: PlanSnapshotRecord = {
      plan_id: 'plan-5',
      version: 1,
      state: {
        days: [
          {
            id: '2024-01-01',
            label: 'Day',
            activities: [],
          },
        ],
      },
      updated_at: '2024-01-01T00:00:00.000Z',
    };
    const entryRows: BudgetEntryRecord[] = [
      { id: 'entry-1', description: null, category: null, amount: null },
      { id: 'entry-2', description: 'Lunch', category: 'food', amount: 20 },
    ];
    vi.mocked(fetchPlanByIdWithMembers).mockResolvedValue(plan);
    vi.mocked(fetchLatestPlanSnapshot).mockResolvedValue(snapshotRow);
    vi.mocked(fetchPlanBudgetEntries).mockResolvedValue(entryRows);

    const experience = await getUserPlannerExperience('plan-5', 'user-5');

    expect(experience).toEqual({
      planId: 'plan-5',
      title: 'Adventure',
      destination: 'Madrid',
      initialDays: [{ id: '2024-01-01', label: 'Day', activities: [], position: '1024' }],
      initialBudget: 666,
      initialEntries: [
        { id: 'entry-1', description: '', category: 'transport', amount: 0 },
        { id: 'entry-2', description: 'Lunch', category: 'food', amount: 20 },
      ],
      editToken: 'token',
      isOwner: true,
      isAdmin: true,
      canManageMembers: true,
    });
  });
});
