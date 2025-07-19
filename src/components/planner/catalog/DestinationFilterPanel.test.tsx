import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DestinationFilterPanel from './DestinationFilterPanel';

const activities = [
  {
    id: '1',
    name: 'Beach Fun',
    description: 'Sun and sand',
    duration: 2,
    image_url: '',
    price: '$10',
    category: 'outdoors',
  },
  {
    id: '2',
    name: 'City Museum',
    description: 'History exhibits',
    duration: 1,
    image_url: '',
    price: '$20',
    category: 'culture',
  },
];

describe('DestinationFilterPanel search', () => {
  it('filters items when typing a query', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ activities }),
    } as unknown as Response);

    render(
      <DestinationFilterPanel
        isOpen={true}
        onClose={() => {}}
        onAdd={() => {}}
        onRemove={() => {}}
      />
    );

    await screen.findByText('Beach Fun');

    const input = screen.getByPlaceholderText('Search') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'museum' } });

    await waitFor(() => {
      expect(screen.queryByText('Beach Fun')).not.toBeInTheDocument();
      expect(screen.getByText('City Museum')).toBeInTheDocument();
    });
  });

  it('calls onClose when clicking outside the dialog', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ activities }),
    } as unknown as Response);

    const onClose = vi.fn();
    render(
      <DestinationFilterPanel
        isOpen={true}
        onClose={onClose}
        onAdd={() => {}}
        onRemove={() => {}}
      />
    );

    await screen.findByText('Beach Fun');

    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog.parentElement as HTMLElement);
    expect(onClose).toHaveBeenCalled();
  });
});
