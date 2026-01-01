import { NextRequest, NextResponse } from 'next/server';

import { getPlanSnapshot } from '@/features/app/planner/server/queries/plans/getPlanSnapshot';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const planId = searchParams.get('planId')?.trim();

  if (!planId) {
    return NextResponse.json({ error: 'Missing planId.' }, { status: 400 });
  }

  try {
    const snapshot = await getPlanSnapshot(planId);
    return NextResponse.json({ snapshot });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unable to fetch plan snapshot.' }, { status: 500 });
  }
}
