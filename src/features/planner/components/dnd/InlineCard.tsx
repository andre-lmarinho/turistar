'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';

import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/utils/cn';
import { ACTIVITY_COPY } from '@/features/planner/domain/constants/activity';
import {
  DEFAULT_COLORS,
  DEFAULT_NEW_CARD_COLOR_INDEX,
} from '@/features/planner/domain/constants/colors';
import { useAddActivity } from '@/features/planner/hooks/useAddActivity';

import { useInlineAutoFocus } from './useInlineAutoFocus';
import { useInlineOutsideSubmit } from './useInlineOutsideSubmit';

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

  const containerRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const outsideSubmitRef = useRef(false);

  const copy = ACTIVITY_COPY.inlineAdd;

  const focusInput = useInlineAutoFocus(inputRef);

  const isInvalid = useMemo(() => {
    return touched && title.trim().length === 0;
  }, [touched, title]);

  const trySubmit = useCallback(async () => {
    setTouched(true);
    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0) {
      setError(null);
      focusInput();
      return false;
    }

    try {
      setError(null);
      await mutateAsync({ dayId, title: trimmedTitle, index: insertIndex });
      return true;
    } catch (err) {
      console.error(err);
      setError(copy.errorGeneric);
      return false;
    }
  }, [copy.errorGeneric, dayId, focusInput, insertIndex, mutateAsync, title]);

  const handleFormSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (isPending || isComposing) {
        return;
      }

      const nativeEvent = event.nativeEvent as Event & { submitter?: EventTarget | null };
      const submitter = nativeEvent.submitter ?? null;
      const shouldClose = submitter instanceof HTMLElement && submitter.dataset.close === 'true';

      const didSubmit = await trySubmit();
      if (!didSubmit) {
        return;
      }

      if (shouldClose) {
        onClose();
        return;
      }

      setTitle('');
      setTouched(false);
      onAdvanceInline?.(insertIndex + 1);
      requestAnimationFrame(focusInput);
    },
    [focusInput, insertIndex, isComposing, isPending, onAdvanceInline, onClose, trySubmit]
  );

  const handleOutsideSubmit = useCallback(() => {
    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0) {
      onClose();
      return;
    }
    if (isPending || outsideSubmitRef.current) {
      return;
    }

    outsideSubmitRef.current = true;
    void trySubmit()
      .then((didSubmit) => {
        if (didSubmit) {
          onClose();
        }
      })
      .finally(() => {
        outsideSubmitRef.current = false;
      });
  }, [isPending, onClose, title, trySubmit]);

  useInlineOutsideSubmit({ containerRef, handleSubmit: handleOutsideSubmit });

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (isComposing) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    },
    [isComposing, onClose]
  );

  return (
    <form ref={containerRef} className={cn('space-y-2', className)} onSubmit={handleFormSubmit}>
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
        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden="true"></button>
        <Button type="submit" variant="primary" disabled={isPending} data-close="true">
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
    </form>
  );
}
