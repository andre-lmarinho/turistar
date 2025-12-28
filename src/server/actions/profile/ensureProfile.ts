'use server';

import { ensureProfile as ensureProfileAction } from '@/features/auth/server/actions/profile/ensureProfile';

export async function ensureProfile() {
  return ensureProfileAction();
}
