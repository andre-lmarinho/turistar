import { NextResponse } from 'next/server';
import { validateGeoapifyQuery } from '@/server/api/geoapify/validateQuery';

describe('validateGeoapifyQuery', () => {
  it('returns an error response when the parameter is missing', async () => {
    const result = validateGeoapifyQuery(new URLSearchParams(), 'text');

    expect(result).toBeInstanceOf(NextResponse);
    const response = result as NextResponse;
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Query is required.' });
  });

  it('returns an error response when the value is shorter than four characters', async () => {
    const params = new URLSearchParams({ text: 'abc' });
    const result = validateGeoapifyQuery(params, 'text');

    expect(result).toBeInstanceOf(NextResponse);
    const response = result as NextResponse;
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'Query must be at least 4 characters.',
    });
  });

  it('returns the string when the parameter is valid', () => {
    const params = new URLSearchParams({ text: 'paris' });

    const result = validateGeoapifyQuery(params, 'text');

    expect(result).toBe('paris');
  });
});
