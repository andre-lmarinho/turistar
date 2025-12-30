import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { LocationSearchInput } from './LocationSearchInput';
import type { SuggestionHook } from '@/features/app/planner/hooks/search/createGeoapifySuggestionHook';
import type { AutocompletePlace } from '@/features/app/planner/types/locations';

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

  function renderWithState(hook: SuggestionHook<AutocompletePlace>, onChange = vi.fn()) {
    function Wrapper() {
      const [value, setValue] = React.useState('');
      return (
        <LocationSearchInput
          value={value}
          onChange={(next) => {
            onChange(next);
            if (typeof next === 'string') {
              setValue(next);
            }
          }}
          autocompleteHook={hook}
        />
      );
    }

    render(<Wrapper />);
    return onChange;
  }

  it('passes the selected place object when clicking a suggestion', async () => {
    const autocompleteHook: SuggestionHook<AutocompletePlace> = vi.fn(() => ({
      results: [
        { name: 'Rome, Italy', latitude: 0, longitude: 0 },
        { name: 'London, UK', latitude: 1, longitude: 1 },
      ],
      loading: false,
      error: false,
    }));

    const handleChange = renderWithState(autocompleteHook);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Rome' } });

    const option = await screen.findByRole('option', { name: 'Rome, Italy' });
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
    const autocompleteHook: SuggestionHook<AutocompletePlace> = vi.fn(() => ({
      results: [
        { name: 'Rome, Italy', latitude: 0, longitude: 0 },
        { name: 'London, UK', latitude: 1, longitude: 1 },
      ],
      loading: false,
      error: false,
    }));

    const handleChange = renderWithState(autocompleteHook);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Rome' } });
    handleChange.mockClear();

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
    const autocompleteHook: SuggestionHook<AutocompletePlace> = vi.fn(() => ({
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
