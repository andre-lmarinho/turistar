import type { SelectMenuOption } from '@/shared/ui/select';

export type ShareTier = 'admin' | 'member';

export const SHARE_TIERS: ReadonlyArray<SelectMenuOption<ShareTier>> = [
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
];
