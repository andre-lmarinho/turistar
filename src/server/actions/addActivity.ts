// src/server/actions/addActivity.ts
'use server';

import { supabaseServer } from '@/shared/lib/supabaseServer';

interface AddActivityInput {
  dayId: string;
  editToken: string;
  title: string;
  startTime?: string; // "HH:mm:ss"
  duration?: number;
  catalogId?: string;
  budget?: number;
  imageUrl?: string;
  color?: string;
  address?: string;
  position?: number;
}

export async function addActivity(input: AddActivityInput) {
  const supabase = supabaseServer();
  const { data, error } = await supabase.rpc('add_activity', {
    _day_id: input.dayId,
    _edit_token: input.editToken,
    _title: input.title,
    _start_time: input.startTime ?? null,
    _duration: input.duration ?? null,
    _catalog_id: input.catalogId ?? null,
    _budget: input.budget ?? null,
    _image_url: input.imageUrl ?? null,
    _color: input.color ?? null,
    _address: input.address ?? null,
    _position: input.position ?? 0,
  });
  if (error) throw error;
  return data as string; // activity id
}
