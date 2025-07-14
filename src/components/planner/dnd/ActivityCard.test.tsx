import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ActivityCard from './ActivityCard';

const activity = { id: 'a1', title: 'Visit museum', color: 'red' } as const;

describe('ActivityCard', () => {
  it('shows edit icon and enters edit mode on click', () => {
    render(<ActivityCard activity={activity} />);

    const editBtn = screen.getByLabelText('Edit card');
    expect(editBtn).toBeInTheDocument();
    expect(editBtn.querySelector('svg')).toBeInTheDocument();

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    fireEvent.click(editBtn);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
