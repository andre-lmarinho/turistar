// tests/unit/features/planner/components/budget/activities/ActivitiesBudget.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ActivitiesBudget from '@/features/planner/components/budget/ActivitiesBudget';
import type { DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import { vi } from 'vitest';

describe('ActivitiesBudget', () => {
  const days: DayPlan[] = [
    {
      id: 'd1',
      label: 'Day 1',
      activities: [{ id: 'a1', title: 'Museum', color: '', budget: 10 }],
    },
  ];

  it('calls onClose when clicking outside the dialog', () => {
    const onClose = vi.fn();
    render(<ActivitiesBudget open days={days} onUpdate={() => {}} onClose={onClose} />);
    const overlay = document.querySelector('[data-slot="modal-overlay"]') as HTMLElement;
    expect(overlay).toBeTruthy();
    fireEvent.pointerDown(overlay);
    fireEvent.pointerUp(overlay);
    fireEvent.click(overlay);
    return waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('allows moving focus between inputs without closing', () => {
    const onClose = vi.fn();
    const multiple: DayPlan[] = [
      {
        id: 'd1',
        label: 'Day 1',
        activities: [
          { id: 'a1', title: 'Museum', color: '', budget: 10 },
          { id: 'a2', title: 'Park', color: '', budget: 5 },
        ],
      },
    ];
    render(<ActivitiesBudget open days={multiple} onUpdate={() => {}} onClose={onClose} />);
    const inputs = screen.getAllByPlaceholderText('Budget') as HTMLInputElement[];
    fireEvent.focus(inputs[0]);
    fireEvent.blur(inputs[0]);
    fireEvent.focus(inputs[1]);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('saves all edited budgets when closing', () => {
    const onUpdate = vi.fn();
    const multiple: DayPlan[] = [
      {
        id: 'd1',
        label: 'Day 1',
        activities: [
          { id: 'a1', title: 'Museum', color: '', budget: 10 },
          { id: 'a2', title: 'Park', color: '', budget: 5 },
        ],
      },
    ];
    render(<ActivitiesBudget open days={multiple} onUpdate={onUpdate} onClose={() => {}} />);
    const inputs = screen.getAllByPlaceholderText('Budget') as HTMLInputElement[];
    fireEvent.change(inputs[0], { target: { value: '20' } });
    fireEvent.change(inputs[1], { target: { value: '30' } });
    fireEvent.click(screen.getByLabelText('Close activities budget dialog'));
    expect(onUpdate).toHaveBeenCalledWith('a1', 20);
    expect(onUpdate).toHaveBeenCalledWith('a2', 30);
  });

  it('does not reset inputs when activities change while open', () => {
    const onClose = vi.fn();
    const initial: DayPlan[] = [
      {
        id: 'd1',
        label: 'Day 1',
        activities: [{ id: 'a1', title: 'Museum', color: '', budget: 10 }],
      },
    ];
    const { rerender } = render(
      <ActivitiesBudget open days={initial} onUpdate={() => {}} onClose={onClose} />
    );
    const input = screen.getByPlaceholderText('Budget') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '20' } });

    const updated: DayPlan[] = [
      {
        id: 'd1',
        label: 'Day 1',
        activities: [
          { id: 'a1', title: 'Museum', color: '', budget: 10 },
          { id: 'a2', title: 'Park', color: '', budget: 5 },
        ],
      },
    ];
    rerender(<ActivitiesBudget open days={updated} onUpdate={() => {}} onClose={onClose} />);
    const inputs = screen.getAllByPlaceholderText('Budget') as HTMLInputElement[];
    expect(inputs[0].value).toBe('20');
    expect(inputs[1].value).toBe('');
  });
});
