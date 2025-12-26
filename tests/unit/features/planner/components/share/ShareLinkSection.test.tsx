import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, beforeEach, expect, vi } from 'vitest';

import { ShareLinkSection } from '@/features/app/planner/components/share/ShareLinkSection';

const {
  mockUsePlanShareLink,
  mockUsePlannerContext,
  createLinkMutate,
  revokeLinkMutate,
  writeTextMock,
} = vi.hoisted(() => ({
  mockUsePlanShareLink: vi.fn(),
  mockUsePlannerContext: vi.fn(),
  createLinkMutate: vi.fn(),
  revokeLinkMutate: vi.fn(),
  writeTextMock: vi.fn(),
}));

vi.mock('@/features/app/planner/hooks/data/usePlanSharing', () => ({
  usePlanShareLink: (...args: unknown[]) => mockUsePlanShareLink(...args),
}));

vi.mock('@/features/app/planner/hooks/PlannerContext', () => ({
  usePlannerContext: () => mockUsePlannerContext(),
}));

describe('ShareLinkSection', () => {
  beforeEach(() => {
    createLinkMutate.mockReset();
    revokeLinkMutate.mockReset();
    writeTextMock.mockReset();
    mockUsePlanShareLink.mockReset();
    mockUsePlannerContext.mockReset();

    mockUsePlannerContext.mockReturnValue({ canManageMembers: true });
    mockUsePlanShareLink.mockReturnValue({
      data: null,
      isLoading: false,
      createLink: { mutate: createLinkMutate, isPending: false },
      revokeLink: { mutate: revokeLinkMutate, isPending: false },
    });

    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
    });
  });

  it('shows the restricted message for non-admins', () => {
    mockUsePlannerContext.mockReturnValue({ canManageMembers: false });

    render(<ShareLinkSection planId="plan-1" />);

    expect(
      screen.getByText('Only admins can generate access links.')
    ).toBeVisible();
  });

  it('creates a link when none exists', () => {
    render(<ShareLinkSection planId="plan-1" />);

    fireEvent.click(screen.getByRole('button', { name: 'Create link' }));

    expect(createLinkMutate).toHaveBeenCalledTimes(1);
  });

  it('copies the share link when available', async () => {
    mockUsePlanShareLink.mockReturnValue({
      data: {
        token: 'token-123',
        createdAt: '2024-01-01T00:00:00.000Z',
        createdBy: 'user-1',
        revokedAt: null,
      },
      isLoading: false,
      createLink: { mutate: createLinkMutate, isPending: false },
      revokeLink: { mutate: revokeLinkMutate, isPending: false },
    });

    render(<ShareLinkSection planId="plan-1" />);

    fireEvent.click(screen.getByRole('button', { name: 'Copy link' }));

    await waitFor(() =>
      expect(writeTextMock).toHaveBeenCalledWith(
        `${window.location.origin}/p/share/token-123`
      )
    );
    expect(screen.getByRole('button', { name: /copied/i })).toBeVisible();
  });

  it('revokes the link when deletion is confirmed', async () => {
    mockUsePlanShareLink.mockReturnValue({
      data: {
        token: 'token-456',
        createdAt: '2024-01-01T00:00:00.000Z',
        createdBy: 'user-1',
        revokedAt: null,
      },
      isLoading: false,
      createLink: { mutate: createLinkMutate, isPending: false },
      revokeLink: { mutate: revokeLinkMutate, isPending: false },
    });

    render(<ShareLinkSection planId="plan-1" />);

    fireEvent.click(screen.getByRole('button', { name: 'Delete link' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Delete' }));

    expect(revokeLinkMutate).toHaveBeenCalledTimes(1);
  });
});
