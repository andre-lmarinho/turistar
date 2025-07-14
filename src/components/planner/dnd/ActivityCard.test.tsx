// src/components/planner/dnd/ActivityCard.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ActivityCard from './ActivityCard';
import { vi } from 'vitest';
import type { Activity, DayPlan } from '@/types';

const baseActivity: Activity & { dayId?: string } = {
  id: 'a1',
  title: 'Visit museum',
  color: 'red',
  duration: 0,
  budget: 0,
};

const defaultProps = {
  activity: baseActivity,
  onChangeDay: vi.fn(),
  availableDays: [] as DayPlan[],
  bgColor: '',
  onChangeColor: vi.fn(),
};

describe('ActivityCard', () => {
  it('shows edit icon and enters edit mode on click', () => {
    render(<ActivityCard {...defaultProps} />);

    const editBtn = screen.getByLabelText('Edit Card');
    expect(editBtn).toBeInTheDocument();
    expect(editBtn.querySelector('svg')).toBeInTheDocument();

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    fireEvent.click(editBtn);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('calls onSelect when activated with Enter or Space', () => {
    const handleSelect = vi.fn();
    render(<ActivityCard {...defaultProps} onSelect={handleSelect} />);

    const titleEl = screen.getByText('Visit museum');
    const card = titleEl.closest('[role="button"]') as HTMLElement;

    expect(card).toHaveAttribute('tabindex', '0');

    fireEvent.keyDown(card, { key: 'Enter' });
    expect(handleSelect).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(card, { key: ' ' });
    expect(handleSelect).toHaveBeenCalledTimes(2);
  });
});
