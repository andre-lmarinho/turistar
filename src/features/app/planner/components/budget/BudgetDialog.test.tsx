import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { BudgetDialog } from './BudgetDialog';

import type { DayPlan } from '@/features/app/planner/domain/types/PlannerEntities';

describe('BudgetDialog', () => {
  const days: DayPlan[] = [
    {
      id: 'd1',
      label: 'Day 1',
      activities: [{ id: 'a1', title: 'Museum', color: '', budget: 10 }],
    },
  ];

  it('calls onClose when the overlay is clicked', async () => {
    const onClose = vi.fn();
    render(<BudgetDialog open days={days} onUpdate={() => {}} onClose={onClose} />);

    await waitFor(() => {
      expect(document.querySelector('[data-radix-dialog-overlay]')).toBeTruthy();
    });

    const overlay = document.querySelector('[data-radix-dialog-overlay]') as Element;
    fireEvent.pointerDown(overlay);
    fireEvent.pointerUp(overlay);

    expect(onClose).toHaveBeenCalled();
  });

  it('allows interacting with inputs without closing', () => {
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

    render(<BudgetDialog open days={multiple} onUpdate={() => {}} onClose={onClose} />);

    const inputs = screen.getAllByPlaceholderText('Budget') as HTMLInputElement[];
    fireEvent.focus(inputs[0]);
    fireEvent.blur(inputs[0]);
    fireEvent.focus(inputs[1]);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('saves edited budgets when the close button is pressed', () => {
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

    render(<BudgetDialog open days={multiple} onUpdate={onUpdate} onClose={() => {}} />);

    const inputs = screen.getAllByPlaceholderText('Budget') as HTMLInputElement[];
    fireEvent.change(inputs[0], { target: { value: '20' } });
    fireEvent.change(inputs[1], { target: { value: '30' } });

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onUpdate).toHaveBeenCalledWith('a1', 20);
    expect(onUpdate).toHaveBeenCalledWith('a2', 30);
  });

  it('retains user input when the activity list updates', () => {
    const onClose = vi.fn();
    const initial: DayPlan[] = [
      {
        id: 'd1',
        label: 'Day 1',
        activities: [{ id: 'a1', title: 'Museum', color: '', budget: 10 }],
      },
    ];

    const { rerender } = render(
      <BudgetDialog open days={initial} onUpdate={() => {}} onClose={onClose} />
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

    rerender(<BudgetDialog open days={updated} onUpdate={() => {}} onClose={onClose} />);

    const inputs = screen.getAllByPlaceholderText('Budget') as HTMLInputElement[];
    expect(inputs[0].value).toBe('20');
    expect(inputs[1].value).toBe('');
  });
});
