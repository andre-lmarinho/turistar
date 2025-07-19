// src/hooks/planner/usePlanTitle.ts
'use client';

import { useState } from 'react';
import { useLocalStorageSync } from '@/lib';

export function usePlanTitle(planId: string, defaultTitle = '') {
  const [title, setTitle] = useState(defaultTitle);
  useLocalStorageSync(`title-${planId}`, title, setTitle);
  return { title, setTitle };
}
