// src/app/planner/BudgetPanel.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BudgetPanel from '@/app/planner/BudgetPanel';

describe('BudgetPanel', () => {
  it('adds expenses and updates totals', () => {
    render(<BudgetPanel activitiesTotal={25} />);
    fireEvent.change(screen.getByPlaceholderText('Description'), {
      target: { value: 'Taxi' },
    });
    fireEvent.change(screen.getByPlaceholderText('Amount'), {
      target: { value: '50' },
    });
    fireEvent.click(screen.getByTitle('Add expense'));
    expect(screen.getByText('$75.00')).toBeInTheDocument();
  });
});
