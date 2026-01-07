import type { SignupCredentials } from "../types";

export function normalizeSignupCredentials(credentials: SignupCredentials): SignupCredentials {
  return {
    email: credentials.email.trim(),
    password: credentials.password,
  };
}
