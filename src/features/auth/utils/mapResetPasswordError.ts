import { extractErrorMessage } from "./extractErrorMessage";

const INVALID_LINK_MESSAGE = "Reset link is invalid or has expired.";
const PKCE_ERROR_FRAGMENT = "PKCE code verifier not found in storage";

export function mapResetPasswordError(error: unknown): string {
  const message = extractErrorMessage(error);
  if (!message) return INVALID_LINK_MESSAGE;
  if (message.includes(PKCE_ERROR_FRAGMENT)) return INVALID_LINK_MESSAGE;
  return message;
}
