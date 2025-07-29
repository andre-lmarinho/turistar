// src/components/planner/dnd/ActivityCardBase.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { DollarSign, Hourglass } from 'lucide-react';
import { EMPTY_ACTIVITY_TITLE } from '@/constants';

interface ActivityCardBaseProps {
  title: string;
  address?: string;
  draftTitle?: string;
  onDraftTitleChange?: (value: string) => void;
  onSave?: () => void;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
  imageUrl?: string;
  duration?: number;
  editing?: boolean;
  twBg?: string;
  budget?: number;
  borderColorClass?: string;
}

export default function ActivityCardBase({
  title,
  draftTitle,
  onDraftTitleChange,
  onSave,
  inputRef,
  imageUrl,
  duration,
  editing = false,
  twBg,
  budget,
  borderColorClass,
}: ActivityCardBaseProps) {
  const isMounted = typeof window !== 'undefined';

  return (
    <div
      className="group relative flex w-full cursor-grab items-stretch rounded-lg border bg-[var(--background)] text-left transition"
      style={{ zIndex: editing ? 50 : undefined }}
    >
      {/* Content */}
      <div
        className={`flex w-40 flex-1 flex-col rounded-lg border border-b-3 ${
          borderColorClass
        } overflow-hidden ${twBg ?? ''}`}
      >
        {/* Image */}
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={title}
            width={400}
            height={200}
            unoptimized
            className="h-30 w-full rounded-t-lg object-cover"
          />
        )}

        {/* Title */}
        {editing ? (
          <textarea
            id="activity-card-title"
            name="activity-card-title"
            ref={inputRef}
            value={draftTitle}
            rows={1}
            onChange={(e) => onDraftTitleChange?.(e.target.value)}
            onInput={(e) => {
              const ta = e.currentTarget;
              ta.style.height = 'auto';
              ta.style.height = `${ta.scrollHeight}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onSave?.();
              }
            }}
            className="bg-background min-h-[5rem] w-full resize-none overflow-hidden px-2 py-1 text-sm"
            style={{ verticalAlign: 'top' }}
          />
        ) : (
          <>
            <h4 className="px-2 py-1 text-sm">{title.trim() ? title : EMPTY_ACTIVITY_TITLE}</h4>
          </>
        )}

        {/* Meta */}
        {isMounted && (duration! > 0 || budget! > 0) && (
          <div className="flex gap-2 rounded-full p-2 text-xs">
            {duration! > 0 && (
              <span className="inline-flex items-center gap-1">
                <Hourglass size={12} aria-hidden="true" />
              </span>
            )}
            {budget! > 0 && (
              <span className="inline-flex items-center gap-1">
                <DollarSign size={12} aria-hidden="true" />
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
