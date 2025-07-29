// src/components/home/DestinationInput.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import DestinationInput from './DestinationInput';

vi.mock('@/hooks', async () => {
  const actual = await vi.importActual<typeof import('@/hooks')>('@/hooks');
  return {
    ...actual,
    useDestinationAutocomplete: () => ({
      results: [
        { name: 'Rome, Italy', latitude: 0, longitude: 0 },
        { name: 'London, UK', latitude: 1, longitude: 1 },
      ],
      loading: false,
    }),
  };
});

describe('DestinationInput', () => {
  it('passes the selected place object when clicking a suggestion', () => {
    const handleChange = vi.fn();
    render(<DestinationInput value="" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Rome' } });

    const option = screen.getByRole('button', { name: 'Rome, Italy' });
    fireEvent.mouseDown(option);

    expect(handleChange).toHaveBeenCalledWith({
      name: 'Rome, Italy',
      latitude: 0,
      longitude: 0,
    });
  });
});
