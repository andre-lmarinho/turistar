import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ActivityModalForm from './ActivityModalForm';
import type { Activity } from '@/types';

vi.mock('@/hooks', async () => {
  const actual = await vi.importActual<typeof import('@/hooks')>('@/hooks');
  return {
    ...actual,
    useDestinationAutocomplete: () => ({
      results: [{ name: 'Rome, Italy', latitude: 0, longitude: 0 }],
      loading: false,
      error: false,
    }),
  };
});

describe('ActivityModalForm', () => {
  it('saves edited address', () => {
    const activity: Activity = { id: 'a1', title: 'Visit', color: '' };
    const onSave = vi.fn();
    render(<ActivityModalForm activity={activity} onSave={onSave} color="" />);
    const addressInput = screen.getByLabelText('Address');
    fireEvent.change(addressInput, { target: { value: 'Ro' } });
    const option = screen.getByRole('button', { name: 'Rome, Italy' });
    fireEvent.mouseDown(option);
    fireEvent.click(screen.getByRole('button', { name: 'Update' }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ address: 'Rome, Italy' }));
  });
});
