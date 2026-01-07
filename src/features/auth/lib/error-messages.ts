export const AUTH_ERROR_MESSAGES = {
  signIn: {
    fallback: "Unable to sign you in.",
  },
  signUp: {
    fallback: "Unable to create your account.",
    needsConfirmation: "Check your email to confirm your account before signing in.",
  },
} as const;

export function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim().length > 0) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  return fallback;
}
