import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, beforeEach, expect, vi } from 'vitest';

import { LoginForm } from '@/features/auth/login/LoginForm';

const { pushMock, refreshMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  refreshMock: vi.fn(),
}));

const { mockSignInWithPassword, mockSignUp, mockFrom, mockSyncServerSession } = vi.hoisted(
  () => ({
    mockSignInWithPassword: vi.fn(),
    mockSignUp: vi.fn(),
    mockFrom: vi.fn(),
    mockSyncServerSession: vi.fn(),
  })
);

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

vi.mock('@/shared/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
    },
    from: mockFrom,
  },
}));

vi.mock('@/shared/lib/auth/sync-server-session', () => ({
  syncServerSession: mockSyncServerSession,
}));

describe('LoginForm', () => {
  beforeEach(() => {
    pushMock.mockReset();
    refreshMock.mockReset();
    mockSignInWithPassword.mockReset();
    mockSignUp.mockReset();
    mockFrom.mockReset();
    mockSyncServerSession.mockReset();
  });

  function mockProfileQuery(result: { data: { slug: string | null } | null; error: unknown }) {
    const maybeSingle = vi.fn().mockResolvedValue(result);
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    mockFrom.mockImplementation(() => ({ select }));
  }

  it('shows a validation error when fields are empty', async () => {
    render(<LoginForm resolveProfile={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Email and password are required.');
  });

  it('shows Supabase errors when sign-in fails', async () => {
    render(<LoginForm resolveProfile={vi.fn()} />);
    const email = screen.getByLabelText(/email/i);
    const password = screen.getByLabelText(/password/i);

    fireEvent.change(email, { target: { value: ' user@example.com ' } });
    fireEvent.change(password, { target: { value: ' secret ' } });

    mockSignInWithPassword.mockResolvedValue({ data: { session: null }, error: { message: 'Bad credentials' } });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(mockSignInWithPassword).toHaveBeenCalled());
    expect(await screen.findByRole('alert')).toHaveTextContent('Bad credentials');
  });

  it('authenticates, reuses an existing slug, and navigates', async () => {
    const resolveProfile = vi.fn();
    mockSignInWithPassword.mockResolvedValue({
      data: { session: { user: { id: 'user-1' }, expires_at: 1 } },
      error: null,
    });
    mockProfileQuery({ data: { slug: 'existing-slug' }, error: null });

    render(<LoginForm resolveProfile={resolveProfile} />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass' } });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(mockSyncServerSession).toHaveBeenCalledWith('SIGNED_IN', {
      user: { id: 'user-1' },
      expires_at: 1,
    }));
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/u/existing-slug/planners'));
    expect(refreshMock).toHaveBeenCalled();
    expect(resolveProfile).not.toHaveBeenCalled();
  });

  it('falls back to resolveProfile when no slug is returned', async () => {
    const resolveProfile = vi.fn().mockResolvedValue('generated-slug');
    mockSignInWithPassword.mockResolvedValue({
      data: { session: { user: { id: 'user-2' }, expires_at: 2 } },
      error: null,
    });
    mockProfileQuery({ data: { slug: null }, error: null });

    render(<LoginForm resolveProfile={resolveProfile} />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'another@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'strong' } });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(resolveProfile).toHaveBeenCalled());
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/u/generated-slug/planners'));
    expect(refreshMock).toHaveBeenCalled();
  });
});
