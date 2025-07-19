import React from 'react';
import { render, screen } from '@testing-library/react';
import DayColumn from './DayColumn';
import type { DayPlan, Activity } from '@/types';

function generateDay(id: string, count: number): DayPlan {
  const activities: Activity[] = Array.from({ length: count }, (_, i) => ({
    id: `${id}-a${i}`,
    title: `Activity ${i}`,
    color: '',
    duration: 0,
    budget: 0,
  }));
  return { id, label: `Day ${id}`, activities };
}

describe('DayColumn scrolling', () => {
  it('uses overflow-y-auto on the outer section', () => {
    const day = generateDay('1', 20);
    render(
      <DayColumn
        day={day}
        days={[day]}
        onAddActivity={() => {}}
        onChangeDay={() => {}}
        onChangeColor={() => {}}
        onDelete={() => {}}
      />
    );
    const header = screen.getByText('Day 1');
    const section = header.closest('section') as HTMLElement;
    expect(section).toHaveClass('overflow-y-auto');
    expect(section.className.includes('overflow-hidden')).toBe(false);
  });
});
