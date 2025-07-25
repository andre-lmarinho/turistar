// src/hooks/ui/useKeyBinds.ts
'use client';

import { useEffect } from 'react';
import { KEY_BINDS } from '@/constants';

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

    function handleKeyDown(e: KeyboardEvent) {
      const key = e.key.toLowerCase();
      switch (key) {
        case KEY_BINDS.planner:
          e.preventDefault();
          onPlanner();
          break;
        case KEY_BINDS.map:
          e.preventDefault();
          onMap();
          break;
        case KEY_BINDS.budget:
          e.preventDefault();
          onBudget();
          break;
        case KEY_BINDS.newCard:
          e.preventDefault();
          onNewCard();
          break;
        case KEY_BINDS.catalog:
          e.preventDefault();
          onCatalog();
          break;
        default:
          break;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, onPlanner, onMap, onBudget, onNewCard, onCatalog]);
}
