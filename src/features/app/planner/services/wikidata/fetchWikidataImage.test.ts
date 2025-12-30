import { vi } from 'vitest';

import { fetchWikidataImage } from './fetchWikidataImage';

const originalFetch = global.fetch;

describe('fetchWikidataImage', () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns a Commons file path URL when a P18 claim exists', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        entities: {
          Q123: {
            claims: {
              P18: [
                {
                  mainsnak: {
                    datavalue: {
                      value: 'File name.png',
                    },
                  },
                },
              ],
            },
          },
        },
      }),
    } as unknown as Response);

    const url = await fetchWikidataImage('Q123');

    expect(url).toBe('https://commons.wikimedia.org/wiki/Special:FilePath/File%20name.png');
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/Q123.json'), undefined);
  });

  it('returns undefined when the fetch fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false } as unknown as Response);
    await expect(fetchWikidataImage('Q123')).resolves.toBeUndefined();
  });
});
