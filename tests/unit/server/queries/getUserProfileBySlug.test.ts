import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createSupabaseServerClient } from '@/shared/lib/supabaseServer';
import { getUserProfileBySlug } from '@/server/queries/profile/getUserProfileBySlug';

vi.mock('@/shared/lib/supabaseServer', () => ({
  createSupabaseServerClient: vi.fn(),
}));

type ProfileRow = {
  id: string;
  slug: string;
  display_name: string | null;
  avatar_url: string | null;
};

type SupabaseResult = {
  data: ProfileRow | null;
  error: unknown;
};

function buildSupabase(result: SupabaseResult) {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });

  const supabase = { from } as unknown as ReturnType<typeof createSupabaseServerClient>;
  return { supabase, select, eq, maybeSingle };
}

describe('getUserProfileBySlug', () => {
  beforeEach(() => {
    vi.mocked(createSupabaseServerClient).mockReset();
  });

  it('returns null when slug is empty or whitespace', async () => {
    const result = await getUserProfileBySlug('   ');

    expect(result).toBeNull();
    expect(createSupabaseServerClient).not.toHaveBeenCalled();
  });

  it('returns null when Supabase has no profile', async () => {
    const { supabase } = buildSupabase({ data: null, error: null });
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

    const profile = await getUserProfileBySlug('alice');

    expect(profile).toBeNull();
  });

  it('propagates Supabase errors', async () => {
    const failure = new Error('fail');
    const { supabase } = buildSupabase({ data: null, error: failure });
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

    await expect(getUserProfileBySlug('alice')).rejects.toBe(failure);
  });

  it('maps Supabase fields to a UserProfileRecord', async () => {
    const data: ProfileRow = {
      id: 'user-1',
      slug: 'alice',
      display_name: 'Alice',
      avatar_url: 'https://avatar.png',
    };
    const { supabase } = buildSupabase({ data, error: null });
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

    const profile = await getUserProfileBySlug('alice');

    expect(profile).toEqual({
      userId: 'user-1',
      slug: 'alice',
      displayName: 'Alice',
      avatarUrl: 'https://avatar.png',
    });
  });
});
