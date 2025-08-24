// tests/unit/features/planner/components/dnd/ActivityCardEditing.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ActivityCardEditing from '@/features/planner/components/dnd/ActivityCardEditing';
import type { Activity, DayPlan } from '@/shared/types';

function renderComponent() {
  const cardRef = React.createRef<HTMLDivElement>();

  const props = {
    activity: { id: 'a1', title: 'Test', color: '', duration: 0, budget: 0 } as Activity & {
      dayId?: string;
    },
    availableDays: [
      { id: 'd1', label: 'Day 1' },
      { id: 'd2', label: 'Day 2' },
    ] as DayPlan[],
    bgColor: 'bg-[var(--color-0)]',
    onChangeColor: vi.fn(),
    onChangeDay: vi.fn(),
    onChangePosition: vi.fn(),
    onSave: vi.fn(),
    onCancel: vi.fn(),
    onDelete: vi.fn(),
    editedImageUrl: '',
    setEditedImageUrl: vi.fn(),
    cardRef,
  };

  render(
    <div>
      <div ref={cardRef}>card</div>
      <ActivityCardEditing {...props} />
    </div>
  );

  return props;
}

describe('ActivityCardEditing', () => {
  it('allows changing color and day via popups', async () => {
    const { onChangeColor, onChangeDay } = renderComponent();

    // color popup
    const colorBtn = await screen.findByRole('button', { name: /card colors/i });
    fireEvent.click(colorBtn);
    await screen.findByRole('dialog', { name: /card background/i });
    const colorOption = screen.getByRole('button', { name: 'Orange' });
    fireEvent.click(colorOption);
    expect(onChangeColor).toHaveBeenCalledWith('bg-[var(--color-1)]');
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /card background/i })).not.toBeInTheDocument();
    });

    // day picker
    const moveBtn = screen.getByRole('button', { name: /move/i });
    fireEvent.click(moveBtn);
    await screen.findByRole('dialog', { name: /change day/i });
    const daySelect = screen.getByLabelText('Day');
    fireEvent.change(daySelect, { target: { value: 'd2' } });
    expect(onChangeDay).toHaveBeenCalledWith('d2');
  });
});
