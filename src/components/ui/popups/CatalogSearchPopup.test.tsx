import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CatalogSearchPopup } from '@/components';
import type { CatalogActivity } from '@/types';

// Mock hooks used by CatalogSearchPopup
const catalog: CatalogActivity[] = [
  {
    id: '1',
    name: 'Beach',
    description: 'Sun and sand',
    duration: 1,
    image_url: '',
    price: '$10',
    category: 'outdoors',
  },
  {
    id: '2',
    name: 'Museum',
    description: 'History',
    duration: 2,
    image_url: '',
    price: '$20',
    category: 'culture',
  },
];

vi.mock('@/hooks', async () => {
  const actual = await vi.importActual<typeof import('@/hooks')>('@/hooks');
  return {
    ...actual,
    useDestinationCatalog: () => {
      const [search, setSearch] = React.useState('');
      const visibleItems = React.useMemo(
        () => catalog.filter((it) => it.name.toLowerCase().includes(search.toLowerCase())),
        [search]
      );
      return { visibleItems, search, setSearch, loading: false, error: null };
    },
    usePopupOutsideHandler: vi.fn(),
    useEscapeKey: vi.fn(),
  };
});

describe('CatalogSearchPopup', () => {
  it('filters catalog items and handles selection', async () => {
    const mockSelect = vi.fn();
    const mockClose = vi.fn();

    render(<CatalogSearchPopup open onSelect={mockSelect} onClose={mockClose} />);

    // both items visible initially
    expect(screen.getByText('Beach')).toBeInTheDocument();
    expect(screen.getByText('Museum')).toBeInTheDocument();

    const input = screen.getByPlaceholderText('Search');
    fireEvent.change(input, { target: { value: 'mus' } });

    await waitFor(() => {
      expect(screen.queryByText('Beach')).not.toBeInTheDocument();
      expect(screen.getByText('Museum')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Museum'));
    expect(mockSelect).toHaveBeenCalledWith(catalog[1]);
    expect(mockClose).toHaveBeenCalled();
  });
});
