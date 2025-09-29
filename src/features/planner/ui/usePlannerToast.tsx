// src/features/planner/ui/usePlannerToast.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';

type ToastType = 'info' | 'error';

export interface PlannerToastPayload {
  message: string;
  type?: ToastType;
}

interface PlannerToastEntry extends PlannerToastPayload {
  id: number;
  type: ToastType;
}

type Listener = (toast: PlannerToastEntry) => void;

const listeners = new Set<Listener>();
let nextId = 1;

export function showPlannerToast(payload: PlannerToastPayload): void {
  const toast: PlannerToastEntry = {
    id: nextId++,
    type: payload.type ?? 'info',
    message: payload.message,
  };
  listeners.forEach((listener) => listener(toast));
}

export function usePlannerToast() {
  return useCallback((payload: PlannerToastPayload) => showPlannerToast(payload), []);
}

export function PlannerToastViewport() {
  const [toasts, setToasts] = useState<PlannerToastEntry[]>([]);

  useEffect(() => {
    const timers = new Map<number, ReturnType<typeof setTimeout>>();

    const handleToast: Listener = (toast) => {
      setToasts((prev) => [...prev, toast]);
      const timer = setTimeout(() => {
        setToasts((prev) => prev.filter((entry) => entry.id !== toast.id));
        timers.delete(toast.id);
      }, 3000);
      timers.set(toast.id, timer);
    };

    listeners.add(handleToast);
    return () => {
      listeners.delete(handleToast);
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-[999] flex w-72 flex-col gap-2"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={`rounded-md px-4 py-3 text-sm shadow-lg ${
            toast.type === 'error'
              ? 'bg-destructive text-destructive-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}

