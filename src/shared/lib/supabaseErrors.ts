import { isRecord, readStringKey } from "./typeGuards";

type ErrorIdentifierValue = string | number | boolean | null | undefined;
type ErrorIdentifiers = Record<string, ErrorIdentifierValue>;

type SupabaseErrorContext = {
  operation: string;
  identifiers?: ErrorIdentifiers;
  error?: unknown;
};

export type SupabaseErrorDetails = {
  message: string;
  details: string;
  code: string;
};

function formatIdentifiers(identifiers?: ErrorIdentifiers): string {
  if (!identifiers) return "";
  const parts = Object.entries(identifiers)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${value ?? "null"}`);
  return parts.length ? ` (${parts.join(" ")})` : "";
}

function extractErrorDetails(error: unknown): string | null {
  if (error == null) return null;
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string") return error;
  if (!isRecord(error)) return null;

  const message = readStringKey(error, "message");
  const details = readStringKey(error, "details");
  const hint = readStringKey(error, "hint");
  const code = readStringKey(error, "code");
  const parts = [message, details, hint, code ? `code=${code}` : null].filter((part): part is string =>
    Boolean(part)
  );
  return parts.length ? parts.join(" | ") : null;
}

function unwrapSupabaseErrorCause(error: unknown): unknown {
  if (error instanceof Error && "cause" in error) {
    return (error as Error & { cause?: unknown }).cause ?? error;
  }
  return error;
}

function readSupabaseErrorDetail(error: unknown, key: keyof SupabaseErrorDetails): string {
  if (!isRecord(error)) return "";
  const value = error[key];
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

export function extractSupabaseErrorDetails(error: unknown): SupabaseErrorDetails {
  const root = unwrapSupabaseErrorCause(error);
  return {
    message: readSupabaseErrorDetail(root, "message"),
    details: readSupabaseErrorDetail(root, "details"),
    code: readSupabaseErrorDetail(root, "code"),
  };
}

export function isSupabaseUserNotRegisteredError(error: unknown): boolean {
  const { message, details, code } = extractSupabaseErrorDetails(error);
  const messageLower = message.toLowerCase();
  const detailsLower = details.toLowerCase();

  return (
    messageLower.includes("not registered") ||
    messageLower.includes("user not found") ||
    messageLower.includes("no user") ||
    detailsLower.includes("not registered") ||
    detailsLower.includes("user not found") ||
    (code === "23503" && (messageLower.includes("user") || detailsLower.includes("user"))) ||
    (code === "P0001" && (messageLower.includes("user") || detailsLower.includes("user")))
  );
}

export function formatSupabaseError({ operation, identifiers, error }: SupabaseErrorContext): Error {
  const identifierText = formatIdentifiers(identifiers);
  const details = extractErrorDetails(error);
  const message = details
    ? `Supabase error during ${operation}${identifierText}. ${details}`
    : `Supabase error during ${operation}${identifierText}.`;

  if (error == null) {
    return new Error(message);
  }

  return new Error(message, { cause: error });
}
