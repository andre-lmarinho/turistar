const USERNAME_REGEX = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

export const MIN_USERNAME_LENGTH = 1;
export const MAX_USERNAME_LENGTH = 28;

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

export function validUsername(username: string): boolean {
  const normalized = normalizeUsername(username);

  if (normalized.length < MIN_USERNAME_LENGTH || normalized.length > MAX_USERNAME_LENGTH) {
    return false;
  }

  return USERNAME_REGEX.test(normalized);
}
