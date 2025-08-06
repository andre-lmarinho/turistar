// tests/unit/features/home/components/DestinationInput.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import DestinationInput from '@/features/home/components/DestinationInput';

const { mockUseDestinationAutocomplete, mockUseDebounce } = vi.hoisted(() => {
  return {
    mockUseDestinationAutocomplete: vi.fn(),
    mockUseDebounce: vi.fn(),
  };
});

vi.mock('@/features/planner', () => ({
  useDestinationAutocomplete: mockUseDestinationAutocomplete,
}));
vi.mock('@/shared/hooks/useDebounce', () => ({
  useDebounce: mockUseDebounce,
}));

describe('DestinationInput', () => {
  beforeEach(() => {
    mockUseDestinationAutocomplete.mockReset();
    mockUseDebounce.mockImplementation((v: unknown) => v);
  });

  it('passes the selected place object when clicking a suggestion', () => {
    mockUseDestinationAutocomplete.mockReturnValue({
      results: [
        { name: 'Rome, Italy', latitude: 0, longitude: 0 },
        { name: 'London, UK', latitude: 1, longitude: 1 },
      ],
      loading: false,
      error: false,
    });

    const handleChange = vi.fn();
    render(<DestinationInput value="" onChange={handleChange} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Rome' } });

    const option = screen.getByRole('option', { name: 'Rome, Italy' });
    fireEvent.mouseDown(option);

    expect(handleChange).toHaveBeenCalledWith({
      name: 'Rome, Italy',
      latitude: 0,
      longitude: 0,
    });
  });

  it('allows selecting a suggestion with keyboard navigation', () => {
    mockUseDestinationAutocomplete.mockReturnValue({
      results: [
        { name: 'Rome, Italy', latitude: 0, longitude: 0 },
        { name: 'London, UK', latitude: 1, longitude: 1 },
      ],
      loading: false,
      error: false,
    });

    const handleChange = vi.fn();
    render(<DestinationInput value="" onChange={handleChange} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Ro' } });

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(handleChange).toHaveBeenCalledWith({
      name: 'London, UK',
      latitude: 1,
      longitude: 1,
    });
  });

  it('renders an error message when the hook returns an error', () => {
    mockUseDestinationAutocomplete.mockReturnValue({
      results: [],
      loading: false,
      error: true,
    });

    render(<DestinationInput value="Paris" onChange={() => {}} />);

    expect(screen.getByText('Failed to load suggestions.')).toBeInTheDocument();
  });
});
