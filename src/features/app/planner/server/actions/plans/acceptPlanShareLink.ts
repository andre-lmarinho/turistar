'use server';

import type { SupabaseClient } from '@supabase/supabase-js';

import { ensureProfile } from '@/features/auth/server/actions/profile/ensureProfile';
import { acceptPlanShareLink as acceptPlanShareLinkRpc } from '@/features/app/planner/server/repositories/PlanShareRepository';
import { supabaseServer } from '@/shared/lib/supabaseServer';

type ErrorFields = {
  message?: string;
  details?: string;
  code?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function extractErrorFields(error: unknown): ErrorFields {
  const direct = isRecord(error) ? error : null;
  const cause = error instanceof Error && 'cause' in error
    ? (error as Error & { cause?: unknown }).cause
    : null;
  const causeRecord = isRecord(cause) ? cause : null;
  const message =
    readString(causeRecord?.message) ??
    readString(direct?.message) ??
    (error instanceof Error ? error.message : null) ??
    undefined;
  const details = readString(causeRecord?.details) ?? readString(direct?.details) ?? undefined;
  const code = readString(causeRecord?.code) ?? readString(direct?.code) ?? undefined;

  return { message, details, code };
}

export async function acceptPlanShareLink(
  token: string,
  client: SupabaseClient = supabaseServer()
): Promise<string> {
  const supabase = client;
  await ensureProfile({ client: supabase });
  let planId: string | null = null;

  try {
    planId = await acceptPlanShareLinkRpc(token, { client: supabase });
  } catch (error) {
    const { message, details, code } = extractErrorFields(error);
    const context = `operation=acceptPlanShareLink token=${token}`;
    const err = new Error(
      message && message.length > 0 ? `${message} (${context})` : `Unable to join planner (${context})`
    );
    if (code) {
      (err as { code?: string }).code = code;
    }
    if (details) {
      (err as { details?: string }).details = details;
    }
    throw err;
  }

  if (!planId) {
    throw new Error(`acceptPlanShareLink failed: token=${token}`);
  }

  return planId;
}
