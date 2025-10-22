'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/utils/cn';
import { ACTIVITY_COPY } from '@/features/planner/domain/constants/activity';
import {
  DEFAULT_COLORS,
  DEFAULT_NEW_CARD_COLOR_INDEX,
} from '@/features/planner/domain/constants/colors';
import { useAddActivity } from '@/features/planner/hooks/useAddActivity';

interface InlineCardProps {
  dayId: string;
  insertIndex: number;
  className?: string;
  onClose: () => void;
  onAdvanceInline?: (nextIndex: number) => void;
}

const NEW_CARD_COLOR = DEFAULT_COLORS[DEFAULT_NEW_CARD_COLOR_INDEX] ?? DEFAULT_COLORS[0];

export function InlineCard({
  dayId,
  insertIndex,
  className,
  onClose,
  onAdvanceInline,
}: InlineCardProps) {
  const { mutateAsync, isPending } = useAddActivity();
  const [title, setTitle] = useState('');
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const outsideSubmitRef = useRef(false);

  const copy = ACTIVITY_COPY.inlineAdd;

  const focusInput = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    const length = input.value.length;
    input.setSelectionRange(length, length);
    if (typeof input.scrollIntoView === 'function') {
      input.scrollIntoView({ block: 'center' });
    }
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(focusInput);
    let viewport: VisualViewport | null = null;

    if (typeof window !== 'undefined') {
      viewport = window.visualViewport ?? null;
      if (viewport) {
        const handler = () => focusInput();
        viewport.addEventListener('resize', handler);
        return () => {
          cancelAnimationFrame(frame);
          viewport?.removeEventListener('resize', handler);
        };
      }
    }

    return () => cancelAnimationFrame(frame);
  }, [focusInput]);

  const isInvalid = useMemo(() => {
    return touched && title.trim().length === 0;
  }, [touched, title]);

  const handleSubmit = useCallback(
    async (mode: 'enter' | 'button') => {
      setTouched(true);
      const trimmedTitle = title.trim();
      if (trimmedTitle.length === 0) {
        setError(null);
        focusInput();
        return;
      }

      try {
        setError(null);
        await mutateAsync({ dayId, title: trimmedTitle, index: insertIndex });
        if (mode === 'enter') {
          setTitle('');
          setTouched(false);
          onAdvanceInline?.(insertIndex + 1);
          requestAnimationFrame(focusInput);
        } else {
          onClose();
        }
      } catch (err) {
        console.error(err);
        setError(copy.errorGeneric);
      }
    },
    [
      copy.errorGeneric,
      dayId,
      focusInput,
      insertIndex,
      mutateAsync,
      onAdvanceInline,
      onClose,
      title,
    ]
  );

  useEffect(() => {
    const attemptSubmitOrClose = () => {
      const trimmedTitle = title.trim();
      if (trimmedTitle.length === 0) {
        onClose();
        return;
      }
      if (isPending || outsideSubmitRef.current) {
        return;
      }

      outsideSubmitRef.current = true;
      Promise.resolve(handleSubmit('button')).finally(() => {
        outsideSubmitRef.current = false;
      });
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!containerRef.current || !(target instanceof Node)) {
        return;
      }
      if (containerRef.current.contains(target)) {
        return;
      }
      attemptSubmitOrClose();
    };

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!containerRef.current || !(target instanceof Node)) {
        return;
      }
      if (containerRef.current.contains(target)) {
        return;
      }
      attemptSubmitOrClose();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('focusin', handleFocusIn);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, [handleSubmit, isPending, onClose, title]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (isComposing) return;

      const isEnter = event.key === 'Enter' && !event.shiftKey;
      const isModifiedEnter = event.key === 'Enter' && (event.metaKey || event.ctrlKey);
      if (isEnter || isModifiedEnter) {
        event.preventDefault();
        if (!isPending) {
          void handleSubmit('enter');
        }
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    },
    [handleSubmit, isComposing, isPending, onClose]
  );

  return (
    <div ref={containerRef} className={cn('space-y-2', className)}>
      <div className={cn(NEW_CARD_COLOR.bg, NEW_CARD_COLOR.border, 'rounded-lg border border-b-3')}>
        <div
          role="group"
          aria-label={copy.a11yGroupLabel}
          className="flex flex-col gap-3"
          data-no-dnd
        >
          <label htmlFor={`inline-add-${dayId}-${insertIndex}`} className="sr-only">
            {copy.placeholderTitle}
          </label>
          <input
            ref={inputRef}
            id={`inline-add-${dayId}-${insertIndex}`}
            data-testid="planner-inline-add-input"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              if (event.target.value.trim().length > 0) {
                setTouched(false);
                setError(null);
              }
            }}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            onKeyDown={handleKeyDown}
            placeholder={copy.placeholderTitle}
            autoCapitalize="sentences"
            autoCorrect="on"
            autoComplete="off"
            inputMode="text"
            enterKeyHint="done"
            aria-invalid={isInvalid || undefined}
            aria-describedby={error ? `inline-add-error-${dayId}-${insertIndex}` : undefined}
            className={cn(
              'focus:ring-primary w-full rounded-lg border px-3 pt-2 pb-1 text-base shadow-sm outline-none focus:ring-2',
              isInvalid ? 'border-red-500 focus:ring-red-500' : 'border-border'
            )}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="primary"
          disabled={isPending}
          onClick={() => void handleSubmit('button')}
        >
          {copy.ctaAdd}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
          {copy.ctaCancel}
        </Button>
        {error && (
          <span
            role="status"
            id={`inline-add-error-${dayId}-${insertIndex}`}
            className="text-sm text-red-500"
          >
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
