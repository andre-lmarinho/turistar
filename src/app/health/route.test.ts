import { GET } from './route';

describe('GET /health', () => {
  it('returns 200 with status and version', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ status: 'ok' });
    expect(typeof json.version).toBe('string');
    expect(json.version.length).toBeGreaterThan(0);
  });
});
