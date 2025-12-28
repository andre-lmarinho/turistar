import type { SelectMenuOption } from '@/features/app/planner/components/ui/SelectMenu';

export type ShareTier = 'admin' | 'member';

export const SHARE_TIERS: ReadonlyArray<SelectMenuOption<ShareTier>> = [
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
];
