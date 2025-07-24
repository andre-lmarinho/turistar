// src/components/planner/dnd/ActivityCardBase.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { DollarSign, Hourglass } from 'lucide-react';
import { EMPTY_ACTIVITY_TITLE } from '@/constants';

interface ActivityCardBaseProps {
  title: string;
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
      className="group w-full text-left flex items-stretch rounded-lg border shadow-sm bg-[var(--background)] hover:shadow-md transition cursor-grab relative"
      style={{ zIndex: editing ? 50 : undefined }}
    >
      {/* Content */}
      <div
        className={`flex-1 flex w-40 flex-col rounded-lg border ${
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
            className="h-30 rounded-t-lg w-full object-cover"
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
            className="w-full min-h-[5rem] bg-background px-2 py-1 text-sm resize-none overflow-hidden"
            style={{ verticalAlign: 'top' }}
          />
        ) : (
          <h4 className="px-2 py-1 font-medium">{title.trim() ? title : EMPTY_ACTIVITY_TITLE}</h4>
        )}

        {/* Meta */}
        {isMounted && (duration! > 0 || budget! > 0) && (
          <div className="flex gap-2 p-2 rounded-full text-xs ">
            {duration! > 0 && (
              <span className="inline-flex items-center gap-1">
                <Hourglass size={12} aria-hidden="true" />
                {duration} h
              </span>
            )}
            {budget! > 0 && (
              <span className="inline-flex items-center gap-1">
                <DollarSign size={12} aria-hidden="true" /> {budget}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
