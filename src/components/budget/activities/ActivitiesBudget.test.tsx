// src/components/budget/activities/ActivitiesBudget.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ActivitiesBudget from './ActivitiesBudget';
import type { DayPlan } from '@/types';

describe('ActivitiesBudget', () => {
  const days: DayPlan[] = [
    {
      id: 'd1',
      label: 'Day 1',
      activities: [{ id: 'a1', title: 'Museum', color: '', budget: 10 }],
    },
  ];

  it('calls onUpdate when budget input loses focus', () => {
    const onUpdate = vi.fn();
    render(<ActivitiesBudget open days={days} onUpdate={onUpdate} onClose={() => {}} />);
    const input = screen.getByPlaceholderText('Budget') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '50' } });
    fireEvent.blur(input);
    expect(onUpdate).toHaveBeenCalledWith('a1', 50);
  });

  it('calls onClose when clicking outside the dialog', () => {
    const onClose = vi.fn();
    render(<ActivitiesBudget open days={days} onUpdate={() => {}} onClose={onClose} />);
    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog.parentElement as HTMLElement);
    expect(onClose).toHaveBeenCalled();
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
});
