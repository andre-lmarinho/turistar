// tests/unit/features/planner/components/ActivityModalForm.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ActivityModalForm from '@/features/planner/components/modal/ActivityModalForm';
import type { Activity } from '@/shared/types';

const { mockUseDestinationAutocomplete, mockUseDebounce } = vi.hoisted(() => {
  return {
    mockUseDestinationAutocomplete: vi.fn(),
    mockUseDebounce: vi.fn(),
  };
});

vi.mock('@/features/planner', () => ({
  useDestinationAutocomplete: mockUseDestinationAutocomplete,
  usePlannerContext: () => ({ destCoords: { lat: 1, lng: 2 } }),
}));

vi.mock('@/shared/hooks/useDebounce', () => ({
  useDebounce: mockUseDebounce,
}));

describe('ActivityModalForm address autocomplete', () => {
  beforeEach(() => {
    mockUseDestinationAutocomplete.mockReset();
    mockUseDebounce.mockImplementation((v: unknown) => v);
  });

  it('saves selected address with coordinates', async () => {
    mockUseDestinationAutocomplete.mockReturnValue({
      results: [{ name: '1 Infinite Loop, CA', latitude: 10, longitude: 20 }],
      loading: false,
      error: null,
    });

    const activity: Activity = { id: '1', title: 'Test', color: 'bg-[var(--color-0)]' };
    const handleSave = vi.fn();
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({} as Response);

    render(
      <ActivityModalForm activity={activity} onSave={handleSave} color="bg-[var(--color-0)]" />
    );

    const input = screen.getByLabelText('Address');
    fireEvent.change(input, { target: { value: '1 In' } });

    const option = await screen.findByRole('option', { name: '1 Infinite Loop, CA' });
    fireEvent.mouseDown(option);

    const saveBtn = screen.getByRole('button', { name: 'Update' });
    fireEvent.click(saveBtn);

    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        address: '1 Infinite Loop, CA',
        latitude: 10,
        longitude: 20,
      })
    );
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
