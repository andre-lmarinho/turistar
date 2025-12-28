type ErrorIdentifierValue = string | number | boolean | null | undefined;
type ErrorIdentifiers = Record<string, ErrorIdentifierValue>;

type SupabaseErrorContext = {
  operation: string;
  identifiers?: ErrorIdentifiers;
  error?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function formatIdentifiers(identifiers?: ErrorIdentifiers): string {
  if (!identifiers) return '';
  const parts = Object.entries(identifiers)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${value ?? 'null'}`);
  return parts.length ? ` (${parts.join(' ')})` : '';
}

function extractErrorDetails(error: unknown): string | null {
  if (error == null) return null;
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string') return error;
  if (!isRecord(error)) return null;

  const message = readString(error, 'message');
  const details = readString(error, 'details');
  const hint = readString(error, 'hint');
  const code = readString(error, 'code');
  const parts = [message, details, hint, code ? `code=${code}` : null].filter(
    (part): part is string => Boolean(part)
  );
  return parts.length ? parts.join(' | ') : null;
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
