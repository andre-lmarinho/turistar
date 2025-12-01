'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';

import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/utils/cn';
import { ACTIVITY_COPY } from '@/features/app/planner/domain/constants/activity';
import { getDefaultActivityColor } from '@/features/app/planner/domain/constants/colors';
import { useAddActivity } from '@/features/app/planner/hooks/useAddActivity';
import { useActivitySuggestions } from '@/features/app/planner/hooks/search/useActivitySuggestions';
import type { ActivitySuggestion } from '@/features/app/planner/types/activitySuggestion';
import { usePlannerContext } from '@/features/app/planner/hooks/PlannerContext';

import { ActivitySuggestionsPanel } from '@/features/app/planner/components/dialog/ActivitySuggestionsPanel';

import { useInlineAutoFocus } from '../../hooks/ui/useInlineAutoFocus';
import { useInlineOutsideSubmit } from '../../hooks/ui/useInlineOutsideSubmit';

interface InlineCardProps {
  dayId: string;
  insertIndex: number;
  className?: string;
  onClose: () => void;
  onAdvanceInline?: (nextIndex: number) => void;
}

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
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const suggestionsPanelRef = useRef<HTMLDivElement>(null);

  const containerRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const outsideSubmitRef = useRef(false);

  const copy = ACTIVITY_COPY.inlineAdd;

  const focusInput = useInlineAutoFocus(inputRef);

  const handleTitleBlur = React.useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      const related = event.relatedTarget as Node | null;
      if (!suggestionsPanelRef.current?.contains(related)) {
        setIsSuggestionsOpen(false);
      }
    },
    []
  );

  const { suggestions, loading, error: suggestionsError } = useActivitySuggestions(title, {
    enabled: title.trim().length >= 3,
  });

  const showSuggestionsPanel = isSuggestionsOpen && title.trim().length >= 3;

  const handleTitleInputChange = (value: string) => {
    setTitle(value);
    if (value.trim().length > 0) {
      setTouched(false);
      setError(null);
    }
    setIsSuggestionsOpen(value.trim().length >= 3);
  };

  const handleTitleFocus = () => {
    if (title.trim().length >= 3) {
      setIsSuggestionsOpen(true);
    }
  };

  const { updateActivity } = usePlannerContext();

  const finalizeInlineActivity = useCallback(() => {
    setTitle('');
    setTouched(false);
    onAdvanceInline?.(insertIndex + 1);
    requestAnimationFrame(focusInput);
  }, [focusInput, insertIndex, onAdvanceInline]);

  const fetchPlaceDetails = async (placeId: string) => {
    try {
      const response = await fetch(`/api/geoapify/place-details?placeId=${encodeURIComponent(placeId)}`);
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch {
      return null;
    }
  };

  const handleSuggestionSelect = async (suggestion: ActivitySuggestion) => {
    setTitle(suggestion.name);
    setTouched(false);
    setError(null);
    setIsSuggestionsOpen(false);

    const activity = await trySubmit();
    if (!activity) {
      requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }

    const body = await fetchPlaceDetails(suggestion.placeId);
    updateActivity(activity.id, {
      title: suggestion.name,
      address: body?.details?.formatted ?? suggestion.formatted,
      description: body?.details?.description ?? suggestion.description,
      imageUrl: body?.wikidataImageUrl ?? undefined,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
    });
    finalizeInlineActivity();
  };

  const isInvalid = useMemo(() => {
    return touched && title.trim().length === 0;
  }, [touched, title]);

  const trySubmit = useCallback(async () => {
    setTouched(true);
    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0) {
      setError(null);
      focusInput();
      return null;
    }

    try {
      setError(null);
      const result = await mutateAsync({ dayId, title: trimmedTitle, index: insertIndex });
      return result;
    } catch (err) {
      console.error(err);
      setError(copy.errorGeneric);
      return null;
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

      const activity = await trySubmit();
      if (!activity) {
        return;
      }

        if (shouldClose) {
          onClose();
          return;
        }

        finalizeInlineActivity();
      },
      [finalizeInlineActivity, isComposing, isPending, onClose, trySubmit]
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
      .then((activity) => {
        if (activity) {
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
      <div
        className={cn(
          getDefaultActivityColor('bg'),
          getDefaultActivityColor('border'),
          'rounded-lg border border-b-3'
        )}
      >
        <div
          role="group"
          aria-label={copy.a11yGroupLabel}
          className="relative flex flex-col gap-3"
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
            onChange={(event) => handleTitleInputChange(event.target.value)}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            onKeyDown={handleKeyDown}
            onFocus={handleTitleFocus}
            onBlur={handleTitleBlur}
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
          {showSuggestionsPanel && (
            <div className="absolute inset-x-0 top-full z-10 mt-1" ref={suggestionsPanelRef}>
              <ActivitySuggestionsPanel
                suggestions={suggestions}
                loading={loading}
                error={Boolean(suggestionsError)}
                onSelect={handleSuggestionSelect}
              />
            </div>
          )}
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
