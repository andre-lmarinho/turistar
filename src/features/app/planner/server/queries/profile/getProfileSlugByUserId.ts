import 'server-only';

import { fetchProfileSlugByUserId } from '@/features/app/planner/services/supabase/profileQueries';

export async function getProfileSlugByUserId(userId: string) {
  return fetchProfileSlugByUserId(userId);
}
