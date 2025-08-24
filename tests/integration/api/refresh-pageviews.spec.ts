// tests/integration/api/refresh-pageviews.spec.ts
import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server.js';
import { GET } from '@/server/api/admin/refresh-pageviews/route';

describe('GET /api/admin/refresh-pageviews', () => {
  it('returns zero updates', async () => {
    const req = new NextRequest('http://localhost/api/admin/refresh-pageviews');
    const res = await GET(req);
    const body = await res.json();
    expect(body.updated).toBe(0);
  });
});
