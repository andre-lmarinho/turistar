// src/components/ui/button-icons/AriaLabel.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('shows tooltip on hover', () => {
    render(
      <div>
        <CloseButton data-testid="close" />
      </div>
    );

    const btn = screen.getByTestId('close').firstChild as HTMLElement;
    fireEvent.mouseEnter(btn);
    expect(screen.getByRole('tooltip')).toHaveTextContent('Close');
  });
});
