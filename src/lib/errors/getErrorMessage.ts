/** Reads a message without sanitizing it; callers decide whether it is safe to display. */
export function getErrorMessage(error: unknown): string | null {
  const message =
    typeof error === "string"
      ? error
      : typeof error === "object" && error !== null && "message" in error
        ? error.message
        : null;
  return typeof message === "string" && message.trim() ? message : null;
}
