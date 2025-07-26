// src/hooks/planner/usePlanParams.ts
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

/**
 * Reads plan parameters from the URL and ensures a plan id exists.
 * - Returns the normalized destination and plan id.
 * - Updates the URL with a generated plan id if missing.
 */
export function usePlanParams() {
  const params = useSearchParams();
  const router = useRouter();

  const dest = params.get('dest')?.trim().toLowerCase() ?? '';
  const [planId] = useState(() => params.get('plan') ?? crypto.randomUUID());

  useEffect(() => {
    if (!params.get('plan')) {
      const search = new URLSearchParams(params.toString());
      search.set('plan', planId);
      router.replace(`/planner?${search.toString()}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId, router]);

  return { dest, planId };
}
