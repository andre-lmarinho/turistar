import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createSupabaseServerClient } from '@/shared/lib/supabaseServer';
import {
  fetchProfileBySlug,
  upsertProfile,
} from '@/features/app/user/server/repositories/ProfileRepository';
import type { ProfileUpsertPayload } from '@/features/app/user/server/repositories/ProfileRepository';

vi.mock('@/shared/lib/supabaseServer', () => ({
  createSupabaseServerClient: vi.fn(),
}));

type ProfileRow = {
  id: string;
  slug: string;
  display_name: string | null;
  avatar_url: string | null;
};

type FetchResult = {
  data: ProfileRow | null;
  error: unknown;
};

type UpsertResult = {
  data: { slug: string } | null;
  error: unknown;
};

function buildFetchSupabase(result: FetchResult) {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });

  const supabase = { from } as unknown as ReturnType<typeof createSupabaseServerClient>;
  return { supabase, from, select, eq, maybeSingle };
}

function buildUpsertSupabase(result: UpsertResult) {
  const single = vi.fn().mockResolvedValue(result);
  const select = vi.fn().mockReturnValue({ single });
  const upsert = vi.fn().mockReturnValue({ select });
  const from = vi.fn().mockReturnValue({ upsert });

  const supabase = { from } as unknown as ReturnType<typeof createSupabaseServerClient>;
  return { supabase, from, upsert, select, single };
}

describe('ProfileRepository', () => {
  beforeEach(() => {
    vi.mocked(createSupabaseServerClient).mockReset();
  });

  describe('fetchProfileBySlug', () => {
    it('returns null when no profile exists', async () => {
      const { supabase, from, select, eq, maybeSingle } = buildFetchSupabase({
        data: null,
        error: null,
      });
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await fetchProfileBySlug('alice');

      expect(result).toBeNull();
      expect(from).toHaveBeenCalledWith('profiles');
      expect(select).toHaveBeenCalledWith('id, slug, display_name, avatar_url');
      expect(eq).toHaveBeenCalledWith('slug', 'alice');
      expect(maybeSingle).toHaveBeenCalled();
    });

    it('throws when Supabase returns an error', async () => {
      const failure = new Error('fail');
      const { supabase } = buildFetchSupabase({ data: null, error: failure });
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      await expect(fetchProfileBySlug('alice')).rejects.toBe(failure);
    });

    it('maps the profile row to a UserProfileRecord', async () => {
      const data: ProfileRow = {
        id: 'user-1',
        slug: 'alice',
        display_name: 'Alice',
        avatar_url: 'https://avatar.png',
      };
      const { supabase } = buildFetchSupabase({ data, error: null });
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await fetchProfileBySlug('alice');

      expect(result).toEqual({
        userId: 'user-1',
        slug: 'alice',
        displayName: 'Alice',
        avatarUrl: 'https://avatar.png',
      });
    });
  });

  describe('upsertProfile', () => {
    const payload: ProfileUpsertPayload = {
      userId: 'user-1',
      slug: 'alice',
      displayName: 'Alice',
      avatarUrl: 'https://avatar.png',
    };

    it('returns the slug on success', async () => {
      const { supabase, from, upsert, select, single } = buildUpsertSupabase({
        data: { slug: 'alice' },
        error: null,
      });
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await upsertProfile(payload);

      expect(result).toEqual({ data: { slug: 'alice' }, error: null });
      expect(from).toHaveBeenCalledWith('profiles');
      expect(upsert).toHaveBeenCalledWith(
        {
          id: 'user-1',
          slug: 'alice',
          display_name: 'Alice',
          avatar_url: 'https://avatar.png',
        },
        { onConflict: 'id' }
      );
      expect(select).toHaveBeenCalledWith('slug');
      expect(single).toHaveBeenCalled();
    });

    it('returns a repository error when Supabase fails', async () => {
      const { supabase } = buildUpsertSupabase({
        data: null,
        error: { code: '23505', message: 'duplicate' },
      });
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await upsertProfile(payload);

      expect(result).toEqual({
        data: null,
        error: { code: '23505', message: 'duplicate' },
      });
    });

    it('uses a fallback error message for unknown errors', async () => {
      const { supabase } = buildUpsertSupabase({
        data: null,
        error: 'unknown',
      });
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await upsertProfile(payload);

      expect(result).toEqual({
        data: null,
        error: { message: 'Supabase error' },
      });
    });
  });
});
