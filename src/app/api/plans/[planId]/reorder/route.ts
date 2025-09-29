// src/app/api/plans/[planId]/reorder/route.ts

import { NextResponse } from 'next/server';
import { z } from 'zod';

import { supabaseServer } from '@/shared/lib/supabaseServer';
import { rankBetween, rebuildRanks } from '@/features/planner/services/rank';

const RequestSchema = z.object({
  itemId: z.string().min(1),
  fromDayId: z.string().min(1),
  toDayId: z.string().min(1),
  toIndex: z.number().int().nonnegative(),
});

export async function POST(
  request: Request,
  { params }: { params: { planId: string } }
) {
  const { planId } = params;

  if (!planId) {
    return NextResponse.json({ error: 'Missing plan id' }, { status: 400 });
  }

  let body: z.infer<typeof RequestSchema>;
  try {
    body = RequestSchema.parse(await request.json());
  } catch (error) {
    console.error('Invalid reorder payload received', error);
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const supabase = supabaseServer();

  const { data: activityRow, error: activityErr } = (await supabase
    .from('activities')
    .select('id, day_id, plan_days!inner(plan_id)')
    .eq('id', body.itemId)
    .maybeSingle()) as unknown as {
    data: { id: string; day_id: string; plan_days: { plan_id: string } } | null;
    error: unknown;
  };

  if (activityErr || !activityRow || activityRow.plan_days.plan_id !== planId) {
    return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
  }

  const { data: targetDay, error: targetErr } = (await supabase
    .from('plan_days')
    .select('id, plan_id')
    .eq('id', body.toDayId)
    .maybeSingle()) as unknown as { data: { id: string; plan_id: string } | null; error: unknown };

  if (targetErr || !targetDay || targetDay.plan_id !== planId) {
    return NextResponse.json({ error: 'Destination day not found' }, { status: 404 });
  }

  const { data: targetActivities, error: listErr } = (await supabase
    .from('activities')
    .select('id, position')
    .eq('day_id', body.toDayId)
    .order('position', { ascending: true })) as unknown as {
    data: { id: string; position: string | null }[] | null;
    error: unknown;
  };

  if (listErr) {
    console.error('Failed to fetch day activities', listErr);
    return NextResponse.json({ error: 'Unable to reorder activities' }, { status: 500 });
  }

  const ordered = (targetActivities ?? []).filter((activity) => activity.id !== body.itemId);
  const insertionIndex = Math.max(0, Math.min(body.toIndex, ordered.length));

  const leftNeighbor = ordered[insertionIndex - 1]?.position ?? null;
  const rightNeighbor = ordered[insertionIndex]?.position ?? null;

  const { position, needsRebalance } = rankBetween(leftNeighbor, rightNeighbor);

  try {
    if (needsRebalance) {
      const ids = [...ordered.map((activity) => activity.id)];
      ids.splice(insertionIndex, 0, body.itemId);
      const ranks = rebuildRanks(ids);
      const updates = ids.map((id) => ({
        id,
        day_id: body.toDayId,
        position: ranks.get(id)!,
      }));
      const { error: upsertErr } = await supabase.from('activities').upsert(updates);
      if (upsertErr) throw upsertErr;
      return NextResponse.json({ position: ranks.get(body.itemId)! });
    }

    const { error: updateErr } = await supabase
      .from('activities')
      .update({ day_id: body.toDayId, position })
      .eq('id', body.itemId);
    if (updateErr) throw updateErr;

    return NextResponse.json({ position });
  } catch (error) {
    console.error('Failed to persist reorder', error);
    return NextResponse.json({ error: 'Unable to persist reorder' }, { status: 500 });
  }
}

