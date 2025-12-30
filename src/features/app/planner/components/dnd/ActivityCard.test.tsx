import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { ActivityCard } from './ActivityCard';

import type { Activity } from '@/features/app/planner/domain/types/PlannerEntities';

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
  it('renders the activity title without exposing an edit action', () => {
    render(<ActivityCard {...defaultProps} />);

    expect(screen.getByText('Visit museum')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /edit card/i })).not.toBeInTheDocument();
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
