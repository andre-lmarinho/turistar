import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BudgetPanel from '@/app/planner/BudgetPanel';

describe('BudgetPanel', () => {
  it('calculates total automatically', () => {
    render(<BudgetPanel />);
    const input = screen.getByLabelText('Transportation') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '50' } });
    expect(screen.getByText('$50.00')).toBeInTheDocument();
  });
});
