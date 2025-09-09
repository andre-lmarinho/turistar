// tests/unit/a11y/activity-modal-header.a11y.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';

import ActivityModalHeader from '@/features/planner/components/modal/ActivityModalHeader';

describe('Accessibility — ActivityModalHeader', () => {
  it('has labeled controls and no violations', async () => {
    const activity = {
      id: 'a1',
      title: 'Visit Museum',
      color: 'bg-[var(--color-0)]',
      dayId: 'd1',
    } as const;
    const days = [{ id: 'd1', label: 'Day 1', activities: [activity] }];

    const { container } = render(
      <ActivityModalHeader
        activity={{ ...activity }}
        bgColor={activity.color}
        onDelete={() => {}}
        onClose={() => {}}
        onColorChange={() => {}}
        availableDays={days}
        onChangeDay={() => {}}
        onChangePosition={() => {}}
        onImageChange={() => {}}
      />
    );

    // Labeled controls
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /card color/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
