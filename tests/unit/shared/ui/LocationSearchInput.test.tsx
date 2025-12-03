import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import {
  LocationSearchInput,
  type LocationAutocompleteHook,
} from '@/features/app/planner/components/ui/LocationSearchInput';

const { mockUseDebounce } = vi.hoisted(() => {
  return {
    mockUseDebounce: vi.fn(),
  };
});
vi.mock('@/features/app/planner/hooks/search/useDebounce', () => ({
  useDebounce: mockUseDebounce,
}));

describe('LocationSearchInput', () => {
  beforeEach(() => {
    mockUseDebounce.mockReset();
    mockUseDebounce.mockImplementation((v: unknown) => v);
  });

  it('passes the selected place object when clicking a suggestion', () => {
    const autocompleteHook: LocationAutocompleteHook = vi.fn(() => ({
      results: [
        { name: 'Rome, Italy', latitude: 0, longitude: 0 },
        { name: 'London, UK', latitude: 1, longitude: 1 },
      ],
      loading: false,
      error: false,
    }));

    const handleChange = vi.fn();
    render(
      <LocationSearchInput value="" onChange={handleChange} autocompleteHook={autocompleteHook} />
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Rome' } });

    const option = screen.getByRole('option', { name: 'Rome, Italy' });
    fireEvent.mouseDown(option);

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Rome, Italy',
        latitude: 0,
        longitude: 0,
        source: 'location',
      })
    );
  });

  it('allows selecting a suggestion with keyboard navigation', () => {
    const autocompleteHook: LocationAutocompleteHook = vi.fn(() => ({
      results: [
        { name: 'Rome, Italy', latitude: 0, longitude: 0 },
        { name: 'London, UK', latitude: 1, longitude: 1 },
      ],
      loading: false,
      error: false,
    }));

    const handleChange = vi.fn();
    render(
      <LocationSearchInput value="" onChange={handleChange} autocompleteHook={autocompleteHook} />
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Ro' } });

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'London, UK',
        latitude: 1,
        longitude: 1,
        source: 'location',
      })
    );
  });

  it('renders an error message when the hook returns an error', () => {
    const autocompleteHook: LocationAutocompleteHook = vi.fn(() => ({
      results: [],
      loading: false,
      error: true,
    }));

    render(
      <LocationSearchInput value="Paris" onChange={() => {}} autocompleteHook={autocompleteHook} />
    );

    expect(screen.getByText('Failed to load suggestions.')).toBeInTheDocument();
  });
});
