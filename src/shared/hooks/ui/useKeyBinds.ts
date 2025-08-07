// src/shared/hooks/ui/useKeyBinds.ts
'use client';

import { useEffect } from 'react';
import { KEY_BINDS } from '@/shared/constants';

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
  useEffect(() => {
    if (!isActive) return;

    const handlers: Record<string, () => void> = {
      [KEY_BINDS.planner]: onPlanner,
      [KEY_BINDS.map]: onMap,
      [KEY_BINDS.budget]: onBudget,
      [KEY_BINDS.newCard]: onNewCard,
      [KEY_BINDS.catalog]: onCatalog,
    };

    function handleKeyDown(e: KeyboardEvent) {
      const active = document.activeElement as HTMLElement | null;
      const isTextField =
        active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA' || active?.isContentEditable;

      if (isTextField) return;
      const key = e.key.toLowerCase();
      const handler = handlers[key];
      if (handler) {
        e.preventDefault();
        handler();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, onPlanner, onMap, onBudget, onNewCard, onCatalog]);
}
