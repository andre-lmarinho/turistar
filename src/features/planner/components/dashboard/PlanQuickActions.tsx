'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';

import type { UserPlannerSummary } from '@/server/queries/plans/getUserPlanners';

type CopyState = 'share' | 'edit' | null;

interface PlanQuickActionsProps {
  plan: UserPlannerSummary;
}

export function PlanQuickActions({ plan }: PlanQuickActionsProps) {
  const [copied, setCopied] = useState<CopyState>(null);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return `/planner/${plan.publicSlug}`;
    }

    return `${window.location.origin}/planner/${plan.publicSlug}`;
  }, [plan.publicSlug]);

  const handleCopy = useCallback((value: string, key: CopyState) => {
    if (!value || !navigator?.clipboard?.writeText) {
      console.warn('Clipboard API is not available in this browser.');
      return;
    }

    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopied(key);
        window.setTimeout(() => setCopied(null), 2500);
      })
      .catch((error) => {
        console.error('Failed to copy planner info', error);
      });
  }, []);

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={`/planner/${plan.publicSlug}`}
        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-md px-3 py-1 text-sm font-medium"
      >
        Open plan
      </Link>
      <button
        type="button"
        className="border-input hover:bg-muted inline-flex items-center rounded-md border px-3 py-1 text-sm"
        onClick={() => handleCopy(shareUrl, 'share')}
      >
        {copied === 'share' ? 'Copied share link' : 'Copy share link'}
      </button>
      <button
        type="button"
        className="border-input hover:bg-muted inline-flex items-center rounded-md border px-3 py-1 text-sm"
        onClick={() => handleCopy(plan.editToken, 'edit')}
      >
        {copied === 'edit' ? 'Copied edit token' : 'Copy edit token'}
      </button>
      <button
        type="button"
        className="border-input text-muted-foreground inline-flex items-center rounded-md border border-dashed px-3 py-1 text-sm"
        disabled
        title="Rename functionality is coming soon"
      >
        Rename (soon)
      </button>
      <button
        type="button"
        className="text-destructive inline-flex items-center rounded-md border border-[var(--destructive)] px-3 py-1 text-sm"
        disabled
        title="Delete functionality is coming soon"
      >
        Delete (soon)
      </button>
    </div>
  );
}
