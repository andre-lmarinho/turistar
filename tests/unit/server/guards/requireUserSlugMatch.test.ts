import { beforeEach, describe, expect, it, vi } from 'vitest';
import { redirect } from 'next/navigation';

import { requireUserSlugMatch } from '@/features/app/user/server/guards/requireUserSlugMatch';
import { getUserProfileBySlug } from '@/features/app/user/server/queries/profile/getUserProfileBySlug';
import { requireUser, UnauthorizedError } from '@/shared/lib/auth/session';

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('@/features/app/user/server/queries/profile/getUserProfileBySlug', () => ({
  getUserProfileBySlug: vi.fn(),
}));

vi.mock('@/shared/lib/auth/session', () => {
  class UnauthorizedError extends Error {
    constructor(message = 'Authentication required.') {
      super(message);
      this.name = 'UnauthorizedError';
    }
  }

  return {
    requireUser: vi.fn(),
    UnauthorizedError,
  };
});

describe('requireUserSlugMatch', () => {
  const redirectError = Object.assign(new Error('NEXT_REDIRECT'), {
    digest: 'NEXT_REDIRECT',
  });

  beforeEach(() => {
    vi.mocked(redirect).mockReset();
    vi.mocked(redirect).mockImplementation(() => {
      throw redirectError;
    });
    vi.mocked(requireUser).mockReset();
    vi.mocked(getUserProfileBySlug).mockReset();
  });

  it('redirects when slug is empty', async () => {
    await expect(requireUserSlugMatch('   ')).rejects.toBe(redirectError);
    expect(redirect).toHaveBeenCalledWith('/login');
    expect(requireUser).not.toHaveBeenCalled();
    expect(getUserProfileBySlug).not.toHaveBeenCalled();
  });

  it('redirects when the user is unauthorized', async () => {
    vi.mocked(requireUser).mockRejectedValue(new UnauthorizedError());

    await expect(requireUserSlugMatch('alice')).rejects.toBe(redirectError);
    expect(redirect).toHaveBeenCalledWith('/login');
  });

  it('redirects when profile is missing', async () => {
    vi.mocked(requireUser).mockResolvedValue({ id: 'user-1' });
    vi.mocked(getUserProfileBySlug).mockResolvedValue(null);

    await expect(requireUserSlugMatch('alice')).rejects.toBe(redirectError);
    expect(redirect).toHaveBeenCalledWith('/login');
    expect(getUserProfileBySlug).toHaveBeenCalledWith('alice');
  });

  it('redirects when profile does not match the user', async () => {
    vi.mocked(requireUser).mockResolvedValue({ id: 'user-1' });
    vi.mocked(getUserProfileBySlug).mockResolvedValue({
      userId: 'user-2',
      slug: 'alice',
      displayName: 'Alice',
      avatarUrl: null,
    });

    await expect(requireUserSlugMatch('alice')).rejects.toBe(redirectError);
    expect(redirect).toHaveBeenCalledWith('/login');
  });

  it('returns user and profile when slug matches', async () => {
    const user = { id: 'user-1', email: 'alice@example.com' };
    const profile = {
      userId: 'user-1',
      slug: 'alice',
      displayName: 'Alice',
      avatarUrl: null,
    };
    vi.mocked(requireUser).mockResolvedValue(user);
    vi.mocked(getUserProfileBySlug).mockResolvedValue(profile);

    await expect(requireUserSlugMatch(' alice ')).resolves.toEqual({ user, profile });
    expect(getUserProfileBySlug).toHaveBeenCalledWith('alice');
  });

  it('wraps unexpected errors with context', async () => {
    const failure = new Error('Supabase failed');
    vi.mocked(requireUser).mockResolvedValue({ id: 'user-1' });
    vi.mocked(getUserProfileBySlug).mockRejectedValue(failure);

    const error = await requireUserSlugMatch('alice').catch((caught) => caught);

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe('Unable to validate user slug match: slug=alice');
    expect((error as Error).cause).toBe(failure);
  });
});
