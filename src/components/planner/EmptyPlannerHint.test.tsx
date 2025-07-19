import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EmptyPlannerHint from './EmptyPlannerHint';
import type { DayPlan } from '@/types';

describe('EmptyPlannerHint integration', () => {
  function Wrapper() {
    const ref = React.useRef<HTMLButtonElement>(null);
    const [days, setDays] = React.useState<DayPlan[]>([
      { id: 'd1', label: 'Day 1', activities: [] },
    ]);

    return (
      <div>
        <button ref={ref}>Add Adventures</button>
        {days.every((d) => d.activities.length === 0) && <EmptyPlannerHint targetRef={ref} />}
        <button
          onClick={() =>
            setDays([
              { id: 'd1', label: 'Day 1', activities: [{ id: 'a1', title: 't', color: '' }] },
            ])
          }
        >
          Add Activity
        </button>
      </div>
    );
  }

  it('shows and hides based on activities', () => {
    render(<Wrapper />);

    expect(screen.getByText(/Start by adding a new adventure/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Add Activity'));
    expect(screen.queryByText(/Start by adding a new adventure/i)).not.toBeInTheDocument();
  });
});
