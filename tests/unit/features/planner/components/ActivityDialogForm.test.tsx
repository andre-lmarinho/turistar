import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ActivityDialogForm } from '@/features/app/planner/components/dialog/ActivityDialogForm';
import type { Activity } from '@/features/app/planner/domain/types/PlannerEntities';

const { mockUseAddressAutocomplete, mockUseDebounce } = vi.hoisted(() => {
  return {
    mockUseAddressAutocomplete: vi.fn(),
    mockUseDebounce: vi.fn(),
  };
});

vi.mock('@/features/app/planner/hooks/search/useAddressAutocomplete', () => ({
  useAddressAutocomplete: mockUseAddressAutocomplete,
}));

vi.mock('@/features/app/planner/hooks/PlannerContext', () => ({
  __esModule: true,
  usePlannerContext: () => ({ destCoords: { lat: 1, lng: 2 }, canEdit: true }),
}));

vi.mock('@/shared/hooks/useDebounce', () => ({
  useDebounce: mockUseDebounce,
}));

describe('ActivityDialogForm address autocomplete', () => {
  beforeEach(() => {
    mockUseAddressAutocomplete.mockReset();
    mockUseDebounce.mockImplementation((v: unknown) => v);
  });

  it('saves selected address with coordinates', async () => {
    mockUseAddressAutocomplete.mockReturnValue({
      results: [{ name: '1 Infinite Loop, CA', latitude: 10, longitude: 20 }],
      loading: false,
      error: false,
    });

    const activity: Activity = { id: '1', title: 'Test', color: 'bg-[var(--color-0)]' };
    const handleSave = vi.fn();
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({} as Response);

    render(
      <ActivityDialogForm activity={activity} onSave={handleSave} color="bg-[var(--color-0)]" />
    );

    const input = screen.getByLabelText('Address');
    fireEvent.change(input, { target: { value: '1 In' } });

    const option = await screen.findByRole('option', { name: '1 Infinite Loop, CA' });
    fireEvent.mouseDown(option);

    await waitFor(() => expect(input).toHaveValue('1 Infinite Loop, CA'));

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
