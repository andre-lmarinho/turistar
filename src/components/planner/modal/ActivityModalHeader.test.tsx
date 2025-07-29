// src/components/planner/modal/ActivityModalHeader.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ActivityModalHeader from './ActivityModalHeader';
import type { Activity, DayPlan, CatalogActivity } from '@/types';

// Stub CatalogSearchPopup to avoid complex behavior
vi.mock('@/components', async () => {
  const actual = await vi.importActual<typeof import('@/components')>('@/components');
  const stubItem: CatalogActivity = {
    id: '1',
    name: 'Stub Item',
    description: 'desc',
    imageUrl: 'img.png',
    address: 'Some street',
    category: '',
  };
  function CatalogSearchPopup({
    open,
    onSelect,
    onClose,
    dest,
  }: {
    open: boolean;
    onSelect: (item: CatalogActivity) => void;
    onClose: () => void;
    dest: string;
  }) {
    if (!open) return null;
    return (
      <div data-testid="catalog-popup">
        <button
          onClick={() => {
            onSelect(stubItem);
            onClose();
          }}
        >
          Pick Stub
        </button>
      </div>
    );
  }
  return { ...actual, CatalogSearchPopup };
});

const sampleActivity: Activity & { dayId?: string } = {
  id: 'a1',
  title: 'Test',
  color: 'red',
};

const defaultProps = {
  activity: sampleActivity,
  bgColor: '',
  onDelete: () => {},
  onClose: () => {},
  onColorChange: () => {},
  onChangePosition: () => {},
  availableDays: [] as DayPlan[],
  onChangeDay: () => {},
  dest: 'rome',
  onImageChange: () => {},
};

it('opens catalog popup and selects an item', () => {
  const handleSelect = vi.fn();
  render(<ActivityModalHeader {...defaultProps} onCatalogSelect={handleSelect} />);

  const searchBtn = screen.getByRole('button', { name: 'Search' });
  fireEvent.click(searchBtn);

  const popup = screen.getByTestId('catalog-popup');
  expect(popup).toBeInTheDocument();

  fireEvent.click(screen.getByText('Pick Stub'));

  expect(handleSelect).toHaveBeenCalledWith({
    id: '1',
    name: 'Stub Item',
    description: 'desc',
    imageUrl: 'img.png',
    address: 'Some street',
    category: '',
  });
  expect(screen.getByAltText('Test')).toHaveAttribute('src', 'img.png');
  expect(screen.queryByTestId('catalog-popup')).not.toBeInTheDocument();
});

it('renders remove photo button only when image exists', () => {
  const withImage = {
    ...sampleActivity,
    imageUrl: 'test.png',
  };
  const { rerender } = render(
    <ActivityModalHeader {...defaultProps} activity={withImage} onCatalogSelect={() => {}} />
  );

  expect(screen.getByRole('button', { name: /remove photo/i })).toBeInTheDocument();

  rerender(
    <ActivityModalHeader {...defaultProps} activity={sampleActivity} onCatalogSelect={() => {}} />
  );

  expect(screen.queryByRole('button', { name: /remove photo/i })).not.toBeInTheDocument();
});
