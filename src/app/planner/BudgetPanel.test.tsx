// src/app/planner/BudgetPanel.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BudgetPanel from '@/app/planner/BudgetPanel';

describe('BudgetPanel', () => {
  it('calculates total automatically and shows activities total read-only', () => {
    render(<BudgetPanel activitiesTotal={25} />);
    const input = screen.getByLabelText('Transportation') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '50' } });
    expect(screen.getByText('$75.00')).toBeInTheDocument();
    expect(screen.getByText('$25.00')).toBeInTheDocument();
    expect(screen.queryByLabelText('Tours & Activities')).toBeNull();
  });
});
