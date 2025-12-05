import { describe, it, expect, beforeEach, vi } from 'vitest';

import { UnauthorizedError, type SupabaseUser } from '@/shared/lib/auth/session';
import { createSupabaseServerClient } from '@/shared/lib/supabaseServer';
import { ensureProfile } from '@/server/actions/profile/ensureProfile';

vi.mock('@/shared/lib/supabaseServer', () => ({
  createSupabaseServerClient: vi.fn(),
}));

type UpsertResponse = {
  data: { slug: string } | null;
  error: { code?: string } | null;
};

type UpsertCall = {
  slug: string;
  display_name: string | null;
  avatar_url: string | null;
};

const mockGetUser = vi.fn();

function createSupabaseWithResponses(responses: UpsertResponse[]) {
  const queue = [...responses];
  const upsertCalls: UpsertCall[] = [];

  const supabase = {
    auth: {
      getUser: mockGetUser,
    },
    from: vi.fn().mockImplementation((table: string) => {
      if (table !== 'profiles') {
        throw new Error(`Unexpected table ${table}`);
      }

      return {
        upsert: (payload: { slug: string; display_name: string | null; avatar_url: string | null }) => {
          upsertCalls.push({
            slug: payload.slug,
            display_name: payload.display_name ?? null,
            avatar_url: payload.avatar_url ?? null,
          });

          const response = queue.shift() ?? { data: null, error: null };
          const single = vi.fn().mockResolvedValue(response);
          const select = vi.fn().mockReturnValue({ single });
          return { select };
        },
      };
    }),
  } as unknown as ReturnType<typeof createSupabaseServerClient>;

  return { supabase, upsertCalls };
}

describe('ensureProfile action', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    vi.mocked(createSupabaseServerClient).mockReset();
  });

  it('throws UnauthorizedError when the session is missing', async () => {
    const supabase = {
      auth: { getUser: mockGetUser },
      from: vi.fn(),
    } as unknown as ReturnType<typeof createSupabaseServerClient>;

    mockGetUser.mockResolvedValue({ data: null, error: { status: 400, message: 'Auth session missing' } });
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

    await expect(ensureProfile()).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('propagates unexpected auth errors', async () => {
    const supabase = {
      auth: { getUser: mockGetUser },
      from: vi.fn(),
    } as unknown as ReturnType<typeof createSupabaseServerClient>;

    const failure = new Error('oh no');
    mockGetUser.mockResolvedValue({ data: null, error: failure });
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

    await expect(ensureProfile()).rejects.toBe(failure);
  });

  it('throws when the auth response has no user', async () => {
    const supabase = {
      auth: { getUser: mockGetUser },
      from: vi.fn(),
    } as unknown as ReturnType<typeof createSupabaseServerClient>;

    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

    await expect(ensureProfile()).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('prefers metadata values and retries slug conflicts until a unique slug is returned', async () => {
    const user: SupabaseUser = {
      id: 'user-123',
      email: 'user@example.com',
      user_metadata: {
        username: 'Cool User',
        full_name: '  Example Name  ',
        avatar_url: 'https://example.com/avatar.png',
      },
    };

    const upsertResponses: UpsertResponse[] = [
      { data: null, error: { code: '23505' } },
      { data: null, error: { code: '23505' } },
      { data: { slug: 'cool-user-2' }, error: null },
    ];

    const { supabase, upsertCalls } = createSupabaseWithResponses(upsertResponses);
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);
    mockGetUser.mockResolvedValue({ data: { user }, error: null });

    const slug = await ensureProfile();

    expect(slug).toBe('cool-user-2');
    expect(upsertCalls.map((call) => call.slug)).toEqual([
      'cool-user',
      'cool-user-1',
      'cool-user-2',
    ]);
    expect(upsertCalls[0].display_name).toBe('Example Name');
    expect(upsertCalls[0].avatar_url).toBe('https://example.com/avatar.png');
  });

  it('falls back to the email prefix for display name and slug base when metadata is missing', async () => {
    const user: SupabaseUser = {
      id: 'user-456',
      email: 'jane.doe@example.com',
      user_metadata: null,
    };

    const upsertResponses: UpsertResponse[] = [{ data: { slug: 'jane-doe' }, error: null }];
    const { supabase, upsertCalls } = createSupabaseWithResponses(upsertResponses);
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);
    mockGetUser.mockResolvedValue({ data: { user }, error: null });

    const slug = await ensureProfile();

    expect(slug).toBe('jane-doe');
    expect(upsertCalls).toHaveLength(1);
    expect(upsertCalls[0].display_name).toBe('jane.doe');
    expect(upsertCalls[0].avatar_url).toBeNull();
  });

  it('throws when slug allocation exceeds the retry limit', async () => {
    const user: SupabaseUser = {
      id: 'user-789',
      email: 'retry@example.com',
      user_metadata: null,
    };

    const conflictResponses = Array.from({ length: 10 }, () => ({ data: null, error: { code: '23505' } }));
    const { supabase, upsertCalls } = createSupabaseWithResponses(conflictResponses);
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);
    mockGetUser.mockResolvedValue({ data: { user }, error: null });

    await expect(ensureProfile()).rejects.toThrow('Unable to allocate a unique slug for the profile');
    expect(upsertCalls).toHaveLength(10);
  });
});
