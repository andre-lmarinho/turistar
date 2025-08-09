const KEY = 'plan_edit_tokens'; // map of plan_id -> token

export function saveEditToken(planId: string, token: string) {
  if (typeof window === 'undefined') return;
  const raw = window.localStorage.getItem(KEY);
  const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
  map[planId] = token;
  window.localStorage.setItem(KEY, JSON.stringify(map));
}

export function getEditToken(planId: string): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return undefined;
  const map = JSON.parse(raw) as Record<string, string>;
  return map[planId];
}
