import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, beforeEach, expect, vi } from 'vitest';

import { SignupForm } from '@/features/auth/signup/SignupForm';

const { pushMock, refreshMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  refreshMock: vi.fn(),
}));

const { mockSignUp, mockFrom, mockSyncServerSession, finalizeProfile } = vi.hoisted(() => ({
  mockSignUp: vi.fn(),
  mockFrom: vi.fn(),
  mockSyncServerSession: vi.fn(),
  finalizeProfile: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

vi.mock('@/shared/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: mockSignUp,
    },
    from: mockFrom,
  },
}));

vi.mock('@/shared/lib/auth/sync-server-session', () => ({
  syncServerSession: mockSyncServerSession,
}));

describe('SignupForm', () => {
  beforeEach(() => {
    pushMock.mockReset();
    refreshMock.mockReset();
    mockSignUp.mockReset();
    mockSyncServerSession.mockReset();
    finalizeProfile.mockReset();
    mockFrom.mockReset();
  });

  it('shows a validation error when fields are empty', async () => {
    render(<SignupForm finalizeProfile={finalizeProfile} />);

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Email and password are required.');
  });

  it('shows Supabase errors when sign up fails', async () => {
    render(<SignupForm finalizeProfile={finalizeProfile} />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pw' } });

    mockSignUp.mockResolvedValue({ data: { session: null }, error: { message: 'Weak password' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => expect(mockSignUp).toHaveBeenCalled());
    expect(await screen.findByRole('alert')).toHaveTextContent('Weak password');
  });

  it('creates the account, finalizes the profile, and navigates', async () => {
    finalizeProfile.mockResolvedValue('new-slug');
    mockSignUp.mockResolvedValue({
      data: { session: { user: { id: 'user-1' }, expires_at: 5 } },
      error: null,
    });

    render(<SignupForm finalizeProfile={finalizeProfile} />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secure' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => expect(mockSyncServerSession).toHaveBeenCalledWith('SIGNED_IN', {
      user: { id: 'user-1' },
      expires_at: 5,
    }));
    await waitFor(() => expect(finalizeProfile).toHaveBeenCalled());
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/u/new-slug/planners'));
    expect(refreshMock).toHaveBeenCalled();
  });

  it('displays a confirmation message when no session is returned', async () => {
    mockSignUp.mockResolvedValue({ data: { session: null }, error: null });

    render(<SignupForm finalizeProfile={finalizeProfile} />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secure' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Check your email to confirm your account before signing in.'
    );
    expect(mockSyncServerSession).not.toHaveBeenCalled();
    expect(finalizeProfile).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
    expect(refreshMock).not.toHaveBeenCalled();
  });
});
