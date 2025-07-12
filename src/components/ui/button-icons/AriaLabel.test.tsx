import React from 'react';
import { render, screen } from '@testing-library/react';
import { CloseButton, RemoveCardButton, CardColorButton } from '@/components';

describe('icon buttons aria-label', () => {
  it('applies aria-label from title prop', () => {
    render(
      <div>
        <CloseButton data-testid="close" />
        <RemoveCardButton data-testid="delete" />
        <CardColorButton data-testid="color" />
      </div>
    );

    expect(screen.getByTestId('close')).toHaveAttribute('aria-label', 'Close');
    expect(screen.getByTestId('delete')).toHaveAttribute('aria-label', 'Delete');
    expect(screen.getByTestId('color')).toHaveAttribute('aria-label', 'Card Color');
  });
});
