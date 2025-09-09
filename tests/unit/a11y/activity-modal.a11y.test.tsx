// tests/unit/a11y/activity-modal.a11y.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { vi } from 'vitest';

const { closeSpy } = vi.hoisted(() => ({ closeSpy: vi.fn() }));

vi.mock('@/features/planner', () => ({
  ActivityModalHeader: () => <div data-testid="activity-modal-header" />,
  ActivityModalForm: () => <form aria-label="Activity form" />,
  usePlannerContext: () => ({
    selectedActivity: {
      id: 'a1',
      title: 'Visit Museum',
      color: 'bg-[var(--color-0)]',
      dayId: 'd1',
    },
    closeModal: closeSpy,
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
  }),
}));

import ActivityModal from '@/features/planner/components/modal/ActivityModal';

describe('Accessibility — ActivityModal', () => {
  it('exposes dialog semantics and closes on Escape', async () => {
    const { container } = render(<ActivityModal />);

    const dialog = screen.getByRole('dialog', { name: 'Edit Activity' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    const results = await axe(container);
    expect(results).toHaveNoViolations();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(closeSpy).toHaveBeenCalled();
  });
});
