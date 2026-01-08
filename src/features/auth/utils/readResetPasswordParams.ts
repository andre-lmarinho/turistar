export type ResetPasswordParams = {
  code: string | null;
  error: string | null;
};

export function readResetPasswordParams(
  searchParams: URLSearchParams,
  hashParams: URLSearchParams | null
): ResetPasswordParams {
  const read = (key: string) => searchParams.get(key) ?? hashParams?.get(key) ?? null;
  const error = read("error_description") ?? read("error_code") ?? read("error");
  return {
    code: read("code"),
    error,
  };
}
