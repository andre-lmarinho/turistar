'use client';

import React from 'react';
import Image from 'next/image';
import { DollarSign, Hourglass } from '@/shared/ui/icon';
import { EMPTY_ACTIVITY_TITLE } from '@/shared/constants/ui';

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
  return (
    <div
      className={`group bg-[var(--background)]text-left relative flex w-full cursor-grab flex-col items-stretch overflow-hidden rounded-lg border border-b-3 transition ${borderColorClass} ${twBg ?? ''}`}
      style={{ zIndex: editing ? 50 : undefined }}
    >
      {/* Image */}
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={title}
          width={400}
          height={200}
          className="h-30 w-full rounded-t-lg object-cover"
        />
      )}

      <div className="px-3 pt-2 pb-1">
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
            className="mb-1 min-h-[5rem] w-full resize-none overflow-hidden px-2 py-1 text-sm"
            style={{ verticalAlign: 'top' }}
          />
        ) : (
          <h4 className="mb-1 text-sm">{title.trim() ? title : EMPTY_ACTIVITY_TITLE}</h4>
        )}

        {/* Meta */}
        {(duration! > 0 || budget! > 0) && (
          <div className="mb-1 flex gap-2 rounded-full text-xs">
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
