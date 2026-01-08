type CheckUsernameAvailabilityResult = {
  available: boolean;
};

export async function checkUsernameAvailability(username: string): Promise<CheckUsernameAvailabilityResult> {
  const response = await fetch(`/api/profile/availability?username=${encodeURIComponent(username)}`);

  if (!response.ok) {
    throw new Error(`checkUsernameAvailability failed: status=${response.status}`);
  }

  const data = (await response.json()) as { available?: boolean };

  return { available: data.available ?? false };
}
