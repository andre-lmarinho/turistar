// src/shared/hooks/ui/useKeyBinds.ts
'use client';

import { useCallback, useMemo } from 'react';
import { KEY_BINDS } from '@/shared/constants';
import { useKeyListener } from './useKeyListener';

interface KeyBindOptions {
  onPlanner: () => void;
  onMap: () => void;
  onBudget: () => void;
  onNewCard: () => void;
  onCatalog: () => void;
  isActive?: boolean;
}

/**
 * Global keyboard shortcuts for common planner actions.
 * Registers a single keydown listener when active and
 * triggers the matching callback.
 */
export function useKeyBinds({
  onPlanner,
  onMap,
  onBudget,
  onNewCard,
  onCatalog,
  isActive = true,
}: KeyBindOptions) {
  const handlers = useMemo(
    () => ({
      [KEY_BINDS.planner]: onPlanner,
      [KEY_BINDS.map]: onMap,
      [KEY_BINDS.budget]: onBudget,
      [KEY_BINDS.newCard]: onNewCard,
      [KEY_BINDS.catalog]: onCatalog,
    }),
    [onPlanner, onMap, onBudget, onNewCard, onCatalog]
  );

  const filter = useCallback((e: KeyboardEvent) => {
    void e;
    const active = document.activeElement as HTMLElement | null;
    const isTextField =
      active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA' || active?.isContentEditable;

    return !isTextField;
  }, []);

  useKeyListener({ keys: handlers, isActive, filter });
}
