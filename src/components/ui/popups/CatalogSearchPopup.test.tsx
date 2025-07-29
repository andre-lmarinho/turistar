// src/components/ui/popups/CatalogSearchPopup.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import CatalogSearchPopup from './CatalogSearchPopup';
import type { CatalogActivity } from '@/types';

vi.mock('@/hooks', async () => {
  const actual = await vi.importActual<typeof import('@/hooks')>('@/hooks');
  return {
    ...actual,
    useGeoapifySearch: (query: string) => ({
      results: query ? ([{ id: '1', name: 'Museum', category: 'sight' }] as CatalogActivity[]) : [],
      loading: false,
      error: false,
    }),
  };
});

describe('CatalogSearchPopup', () => {
  it('renders search results and handles selection', () => {
    const handleSelect = vi.fn();
    render(<CatalogSearchPopup open onSelect={handleSelect} onClose={() => {}} />);

    const input = screen.getByPlaceholderText('Search');
    fireEvent.change(input, { target: { value: 'mus' } });

    const itemBtn = screen.getByRole('button', { name: 'Museum' });
    fireEvent.click(itemBtn);

    expect(handleSelect).toHaveBeenCalledWith({ id: '1', name: 'Museum', category: 'sight' });
  });
});
