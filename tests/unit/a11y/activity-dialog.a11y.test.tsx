import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { vi } from 'vitest';

const { closeSpy } = vi.hoisted(() => ({ closeSpy: vi.fn() }));

vi.mock('@/features/app/planner/components/dialog/ActivityDialogHeader', () => ({
  __esModule: true,
  ActivityDialogHeader: () => <div data-testid="activity-dialog-header" />,
}));

vi.mock('@/features/app/planner/components/dialog/ActivityDialogForm', () => ({
  __esModule: true,
  ActivityDialogForm: () => <form aria-label="Activity form" />,
}));

vi.mock('@/features/app/planner/hooks/PlannerContext', () => ({
  __esModule: true,
  usePlannerContext: () => ({
    selectedActivity: {
      id: 'a1',
      title: 'Visit Museum',
      color: 'bg-[var(--color-0)]',
      dayId: 'd1',
    },
    closeDialog: closeSpy,
    deleteActivity: vi.fn(),
    changeColor: vi.fn(),
    days: [
      {
        id: 'd1',
        label: 'Day 1',
        activities: [{ id: 'a1', title: 'Visit Museum', color: 'bg-[var(--color-0)]' }],
      },
    ],
    changeDay: vi.fn(),
    changePosition: vi.fn(),
    save: vi.fn(),
    canEdit: true,
  }),
}));

import { ActivityDialog } from '@/features/app/planner/components/dialog/ActivityDialog';

describe('Accessibility — ActivityDialog', () => {
  it('exposes dialog semantics and closes on Escape', async () => {
    const { container } = render(<ActivityDialog />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    const results = await axe(container);
    expect(results).toHaveNoViolations();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(closeSpy).toHaveBeenCalled();
  });
});
