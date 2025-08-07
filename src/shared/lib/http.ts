// src/shared/lib/http.ts

/**
 * Performs a GET request to an API endpoint and parses the JSON response.
 * Throws an error with the provided message when the response is not OK.
 */
export async function fetchJson<T>(
  path: string,
  params: Record<string, string>,
  errorMessage: string
): Promise<T> {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${path}?${query}`);
  if (!res.ok) {
    throw new Error(`${errorMessage}: HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}
