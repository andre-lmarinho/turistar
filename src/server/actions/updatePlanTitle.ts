// src/server/actions/updatePlanTitle.ts
'use server';

import { supabaseServer } from '@/shared/lib/supabaseServer';

import {
  getFriendlyZodMessage,
  updatePlanTitleSchema,
  type UpdatePlanTitleInput,
} from './planSchemas';

export async function updatePlanTitle(
  planId: UpdatePlanTitleInput['planId'],
  editToken: UpdatePlanTitleInput['editToken'],
  newTitle: UpdatePlanTitleInput['title']
) {
  let parsed;
  try {
    parsed = updatePlanTitleSchema.parse({ planId, editToken, title: newTitle });
  } catch (error) {
    throw new Error(getFriendlyZodMessage(error, 'Invalid data for updating the plan title.'));
  }

  const supabase = supabaseServer();
  const { error } = await supabase.rpc('update_plan_title', {
    _plan_id: parsed.planId,
    _edit_token: parsed.editToken,
    _new_title: parsed.title,
  });
  if (error) throw error;
}
