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
});
