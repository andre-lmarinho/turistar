import { NextResponse } from 'next/server';

import type { PlanEventInsert } from '@/features/app/planner/domain/types/PlanEvent';
import { appendPlanEvents } from '@/features/app/planner/server/actions/plans/appendPlanEvents';

type AppendBody = {
  planId?: string;
  baseVersion?: number;
  events?: PlanEventInsert[];
};

export async function POST(request: Request) {
  let payload: AppendBody;
  try {
    payload = (await request.json()) as AppendBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const planId = typeof payload.planId === 'string' ? payload.planId.trim() : '';
  if (!planId) {
    return NextResponse.json({ error: 'Missing planId.' }, { status: 400 });
  }

  if (!Number.isFinite(payload.baseVersion)) {
    return NextResponse.json({ error: 'Invalid baseVersion.' }, { status: 400 });
  }

  if (!Array.isArray(payload.events)) {
    return NextResponse.json({ error: 'Invalid events payload.' }, { status: 400 });
  }

  try {
    const baseVersion = Number(payload.baseVersion);
    const result = await appendPlanEvents(planId, baseVersion, payload.events);
    return NextResponse.json({ version: result.version, events: result.events });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unable to append plan events.' }, { status: 500 });
  }
}
