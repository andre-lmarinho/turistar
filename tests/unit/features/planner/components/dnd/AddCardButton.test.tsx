import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { ACTIVITY_COPY } from '@/features/app/planner/domain/constants/activity';

type ButtonProps = {
  dayId: string;
  insertIndex: number;
  className?: string;
  placement?: 'between' | 'end';
  onInlineOpen?: (index: number) => void;
  isInlineOpen?: boolean;
  isHidden?: boolean;
};

const addBlankAndSelect = vi.fn();

vi.mock('@/features/app/planner/hooks/PlannerContext', () => ({
  usePlannerContext: () => ({
    addBlankAndSelect,
    canEdit: true,
  }),
}));

const copy = ACTIVITY_COPY.inlineAdd;

describe('AddCardButton', () => {
  beforeEach(() => {
    vi.resetModules();
    addBlankAndSelect.mockReset();
    delete process.env.NEXT_PUBLIC_PLANNER_INLINE_ADD;
  });

  const renderButton = async (props: Partial<ButtonProps> = {}) => {
    const addCardModule = await import('@/features/app/planner/components/dnd/AddCardButton');
    const { AddCardButton } = addCardModule;
    return render(<AddCardButton dayId="d1" insertIndex={props.insertIndex ?? 0} {...props} />);
  };

  it('renders a collapsed trigger with accessible label', async () => {
    await renderButton();

    const trigger = screen.getByRole('button', { name: copy.collapsedLabel });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('invokes onInlineOpen when inline add is enabled', async () => {
    const onInlineOpen = vi.fn();
    await renderButton({ onInlineOpen, insertIndex: 2 });

    fireEvent.click(screen.getByRole('button', { name: copy.collapsedLabel }));

    expect(onInlineOpen).toHaveBeenCalledWith(2);
    expect(addBlankAndSelect).not.toHaveBeenCalled();
  });

  it('falls back to dialog creation when no inline handler is provided', async () => {
    await renderButton();

    fireEvent.click(screen.getByRole('button', { name: copy.collapsedLabel }));

    expect(addBlankAndSelect).toHaveBeenCalledWith('d1', 0);
  });

  it('uses aria-expanded to reflect open state', async () => {
    await renderButton({ isInlineOpen: true });

    expect(screen.getByRole('button', { name: copy.collapsedLabel })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });

  it('applies the hidden class when requested', async () => {
    await renderButton({ isHidden: true });

    expect(screen.getByRole('button', { name: copy.collapsedLabel })).toHaveClass('hidden');
  });
});
