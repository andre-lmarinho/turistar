import { NextResponse } from 'next/server';

/**
 * Validates that a Geoapify request contains the required query parameter.
 * Returns the original string when valid or an error response otherwise.
 */
import { GEOAPIFY_MIN_QUERY_LENGTH } from '@/features/app/planner/services/geoapify/config';

export function validateGeoapifyQuery(
  searchParams: URLSearchParams,
  param: string
): string | NextResponse {
  const value = searchParams.get(param);
  if (!value) {
    return NextResponse.json({ error: 'Query is required.' }, { status: 400 });
  }

  if (value.length < GEOAPIFY_MIN_QUERY_LENGTH) {
    return NextResponse.json(
      { error: `Query must be at least ${GEOAPIFY_MIN_QUERY_LENGTH} characters.` },
      { status: 400 }
    );
  }

  return value;
}
