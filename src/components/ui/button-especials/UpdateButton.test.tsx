// src/components/ui/button-especials/UpdateButton.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import { UpdateButton } from '@/components';

describe('UpdateButton', () => {
  it('is disabled when ready is false', () => {
    render(<UpdateButton ready={false}>Update</UpdateButton>);
    const button = screen.getByRole('button', { name: 'Update' });
    expect(button).toBeDisabled();
  });

  it('is enabled when ready is true', () => {
    render(<UpdateButton ready={true}>Update</UpdateButton>);
    const button = screen.getByRole('button', { name: 'Update' });
    expect(button).toBeEnabled();
  });
});
