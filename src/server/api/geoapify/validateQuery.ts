import { NextResponse } from 'next/server';

/**
 * Validates that a Geoapify request contains the required query parameter.
 * Returns the original string when valid or an error response otherwise.
 */
export function validateGeoapifyQuery(
  searchParams: URLSearchParams,
  param: string
): string | NextResponse {
  const value = searchParams.get(param);
  if (!value) {
    return NextResponse.json({ error: 'Query is required.' }, { status: 400 });
  }

  if (value.length < 4) {
    return NextResponse.json({ error: 'Query must be at least 4 characters.' }, { status: 400 });
  }

  return value;
}
