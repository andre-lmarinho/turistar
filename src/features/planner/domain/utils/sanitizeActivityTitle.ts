export function sanitizeActivityTitle(
  title: string | null | undefined,
  fallback = 'Untitled activity'
): string {
  const trimmed = title?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}
