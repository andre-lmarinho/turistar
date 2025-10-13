import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActivityCard } from '@/features/planner/components/dnd/ActivityCard';
import { vi } from 'vitest';
import type { Activity } from '@/features/planner/domain/types/PlannerEntities';

const baseActivity: Activity & { dayId?: string } = {
  id: 'a1',
  title: 'Visit museum',
  color: 'bg-[var(--color-1)]',
  duration: 0,
  budget: 0,
};

const defaultProps = {
  activity: baseActivity,
  bgColor: '',
};

describe('ActivityCard', () => {
  it('renders edit button and enters edit mode on click', () => {
    render(<ActivityCard {...defaultProps} />);

    const editBtn = screen.getByRole('button', { name: /edit card/i });
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
    const cardButton = titleEl.closest('button') as HTMLElement;
    expect(cardButton).toHaveAttribute('type', 'button');

    fireEvent.keyDown(cardButton, { key: 'Enter', code: 'Enter' });
    expect(handleSelect).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(cardButton, { key: ' ', code: 'Space' });
    expect(handleSelect).toHaveBeenCalledTimes(2);
  });
});
