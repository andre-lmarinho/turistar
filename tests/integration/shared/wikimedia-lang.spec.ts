// tests/integration/shared/wikimedia-lang.spec.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fetchWikimediaSignals } from '@/shared/lib/wikimedia';

const originalFetch = global.fetch;

describe('fetchWikimediaSignals language support', () => {
  beforeEach(() => {
    const page = {
      pageid: 1,
      title: 'Tour Eiffel',
      extract: 'La tour Eiffel est une tour...',
      original: { source: 'https://upload.wikimedia.org/fr.jpg', width: 1, height: 1 },
      pageprops: { wikibase_item: 'Q243' },
    };
    const response = { query: { pages: { '1': page } } };
    const pv = { items: [] };
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => response })
      .mockResolvedValueOnce({ ok: true, json: async () => response })
      .mockResolvedValueOnce({ ok: true, json: async () => pv });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('uses domain for non-English articles', async () => {
    const sig = await fetchWikimediaSignals({ title: 'Eiffel Tower', lang: 'fr' });
    expect(sig?.title).toBe('Tour Eiffel');
    expect(sig?.description).toContain('tour Eiffel');
    expect(sig?.imageUrl).toBe('https://upload.wikimedia.org/fr.jpg');
    expect(sig?.pageUrl).toBe('https://fr.wikipedia.org/wiki/Tour_Eiffel');
    const calls = (global.fetch as any).mock.calls;
    expect(calls[0][0]).toContain('fr.wikipedia.org');
    expect(calls[1][0]).toContain('fr.wikipedia.org');
  });
});
