// src/features/planner/hooks/internal/useKeyBinds.ts
'use client';

import { useCallback, useMemo } from 'react';
import { KEY_BINDS } from '@/features/planner/domain/constants/keyBinds';
import { useKeyListener } from '@/shared/hooks/ui/useKeyListener';

interface KeyBindOptions {
  onPlanner: () => void;
  onMap: () => void;
  onBudget: () => void;
  onNewCard: () => void;
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
  isActive = true,
}: KeyBindOptions) {
  const handlers = useMemo(
    () => ({
      [KEY_BINDS.planner]: onPlanner,
      [KEY_BINDS.map]: onMap,
      [KEY_BINDS.budget]: onBudget,
      [KEY_BINDS.newCard]: onNewCard,
    }),
    [onPlanner, onMap, onBudget, onNewCard]
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
