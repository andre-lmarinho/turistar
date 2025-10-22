import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { InlineCard } from '@/features/planner/components/dnd/InlineCard';
import { ACTIVITY_COPY } from '@/features/planner/domain/constants/activity';

declare global {
  interface Window {
    requestAnimationFrame(callback: FrameRequestCallback): number;
    cancelAnimationFrame(handle: number): void;
  }
}

const mutateAsync = vi.fn();

vi.mock('@/features/planner/hooks/useAddActivity', () => ({
  useAddActivity: () => ({ mutateAsync, isPending: false }),
}));

const copy = ACTIVITY_COPY.inlineAdd;

beforeAll(() => {
  window.requestAnimationFrame = (cb: FrameRequestCallback) => {
    return window.setTimeout(() => cb(performance.now()), 0);
  };
  window.cancelAnimationFrame = (handle: number) => {
    window.clearTimeout(handle);
  };
});

afterAll(() => {
  delete (window as Partial<Window>).requestAnimationFrame;
  delete (window as Partial<Window>).cancelAnimationFrame;
});

beforeEach(() => {
  mutateAsync.mockReset();
});

describe('InlineCard', () => {
  it('focuses the input on mount', async () => {
    render(<InlineCard dayId="d1" insertIndex={0} onClose={vi.fn()} />);

    const input = await screen.findByTestId('planner-inline-add-input');
    await waitFor(() => expect(input).toHaveFocus());
  });

  it('prevents submission when the title is empty', async () => {
    render(<InlineCard dayId="d1" insertIndex={1} onClose={vi.fn()} />);

    const input = await screen.findByTestId('planner-inline-add-input');
    const form = input.closest('form');
    expect(form).not.toBeNull();
    fireEvent.submit(form!);

    expect(mutateAsync).not.toHaveBeenCalled();
    await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'));
  });

  it('submits with Enter, clears the input, and keeps focus', async () => {
    mutateAsync.mockResolvedValue({});
    const onAdvanceInline = vi.fn();
    render(
      <InlineCard dayId="d1" insertIndex={2} onClose={vi.fn()} onAdvanceInline={onAdvanceInline} />
    );

    const input = await screen.findByTestId('planner-inline-add-input');
    fireEvent.change(input, { target: { value: 'Morning coffee' } });
    const form = input.closest('form');
    expect(form).not.toBeNull();
    fireEvent.submit(form!);

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({ dayId: 'd1', title: 'Morning coffee', index: 2 })
    );
    await waitFor(() => expect(input).toHaveValue(''));
    await waitFor(() => expect(input).toHaveFocus());
    await waitFor(() => expect(onAdvanceInline).toHaveBeenCalledWith(3));
  });

  it('submits via the Add button and calls onClose afterwards', async () => {
    mutateAsync.mockResolvedValue({});
    const onClose = vi.fn();
    render(<InlineCard dayId="d1" insertIndex={3} onClose={onClose} />);

    const input = await screen.findByTestId('planner-inline-add-input');
    fireEvent.change(input, { target: { value: 'Dinner' } });
    fireEvent.click(screen.getByRole('button', { name: copy.ctaAdd }));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({ dayId: 'd1', title: 'Dinner', index: 3 })
    );
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn();
    render(<InlineCard dayId="d1" insertIndex={0} onClose={onClose} />);

    const input = await screen.findByTestId('planner-inline-add-input');
    fireEvent.keyDown(input, { key: 'Escape' });

    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('calls onClose when the user clicks outside', async () => {
    const onClose = vi.fn();
    render(<InlineCard dayId="d1" insertIndex={0} onClose={onClose} />);

    await screen.findByTestId('planner-inline-add-input');
    fireEvent.pointerDown(document.body);

    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('submits and closes when clicking outside with a value', async () => {
    mutateAsync.mockResolvedValue({});
    const onClose = vi.fn();
    render(<InlineCard dayId="d1" insertIndex={1} onClose={onClose} />);

    const input = await screen.findByTestId('planner-inline-add-input');
    fireEvent.change(input, { target: { value: 'Lunch' } });
    fireEvent.pointerDown(document.body);

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({ dayId: 'd1', title: 'Lunch', index: 1 })
    );
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('shows an error message when submission fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mutateAsync.mockRejectedValueOnce(new Error('fail'));
    render(<InlineCard dayId="d1" insertIndex={0} onClose={vi.fn()} />);

    const input = await screen.findByTestId('planner-inline-add-input');
    fireEvent.change(input, { target: { value: 'City tour' } });
    fireEvent.click(screen.getByRole('button', { name: copy.ctaAdd }));

    await waitFor(() => expect(screen.getByText(copy.errorGeneric)).toBeInTheDocument());
    expect(mutateAsync).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
