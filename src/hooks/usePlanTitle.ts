// src/hooks/usePlanTitle.ts
'use client';

import { useState } from 'react';
import { useLocalStorageSync } from '@/lib';

/**
 * Stores the planner title in local storage.
 * - Returns the current title and an updater function.
 */

export function usePlanTitle(planId: string, defaultTitle = '') {
  const [title, setTitle] = useState(defaultTitle);
  useLocalStorageSync(`title-${planId}`, title, setTitle);
  return { title, setTitle };
}
