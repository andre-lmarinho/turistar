// tests/unit/shared/ui/popups/CatalogSearchPopup.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import CatalogSearchPopup from '@/shared/ui/popups/CatalogSearchPopup';
const { mockUseCatalogActivities } = vi.hoisted(() => ({
  mockUseCatalogActivities: vi.fn(),
}));

vi.mock('@/hooks', async () => {
  const actual = await vi.importActual<typeof import('@/hooks')>('@/hooks');
  return {
    ...actual,
    useCatalogActivities: mockUseCatalogActivities,
  };
});

vi.mock('@/contexts', () => ({
  usePlannerContext: () => ({ planId: 'p1', dest: 'rome' }),
}));

describe('CatalogSearchPopup', () => {
  beforeEach(() => {
    mockUseCatalogActivities.mockReset();
  });
  it('renders search results and handles selection', () => {
    mockUseCatalogActivities.mockReturnValue({
      activities: [{ id: '1', name: 'Museum', category: 'sight' }],
      isLoading: false,
      isError: false,
    });
    const handleSelect = vi.fn();
    render(<CatalogSearchPopup open onSelect={handleSelect} onClose={() => {}} />);

    const input = screen.getByPlaceholderText('Search');
    fireEvent.change(input, { target: { value: 'mus' } });

    const itemBtn = screen.getByRole('button', { name: 'Museum' });
    fireEvent.click(itemBtn);

    expect(handleSelect).toHaveBeenCalledWith({ id: '1', name: 'Museum', category: 'sight' });
  });

  it('shows an error message when loading fails', () => {
    mockUseCatalogActivities.mockReturnValue({
      activities: [],
      isLoading: false,
      isError: true,
    });
    render(<CatalogSearchPopup open onSelect={() => {}} onClose={() => {}} />);

    expect(screen.getByText('Failed to load results.')).toBeInTheDocument();
  });
});
