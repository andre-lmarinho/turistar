// src/components/planner/dnd/ActivityCard.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Clock, Hourglass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Activity } from '@/types/itinerary';
import { EMPTY_ACTIVITY_TITLE } from '@/constants/ui';
import ReactDOM from 'react-dom';

/**
 * Card shown inside DayColumn.
 * - Becomes **clickable** via `onSelect` (opens edit-modal).
 * - Renders a colour strip at the left if `activity.color` is set.
 * - Now accepts the core Activity type as is.
 */
interface ActivityCardProps {
  activity: Activity; // The core activity type used across the app
  onSelect?: () => void; // optional click handler
  onTitleSave?: (newTitle: string) => void; // inline title update
}

export default function ActivityCard({ activity, onSelect, onTitleSave }: ActivityCardProps) {
  const { title, startTime, duration, color, imageUrl } = activity;

  /* Tailwind class (e.g. "bg-sky-500") OR inline hex style */
  const twBg = color && !color.startsWith('#') ? color : undefined;

  /*
   * Prevents hydration mismatch by ensuring this section only renders on the client side.
   * Next.js can render inconsistent initial markup between server and client for dynamic values.
   * This guard ensures the conditional content is only rendered after the component is mounted in the browser.
   */
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  /* ------------------------- inline editing ------------------------- */
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function save() {
    const trimmed = draftTitle.trim();
    if (trimmed && trimmed !== title) {
      onTitleSave?.(trimmed);
    }
    setEditing(false);
  }

  function cancel() {
    setDraftTitle(title);
    setEditing(false);
  }
  /* ========================================================================================================== */

  return (
    <>
      {editing &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={cancel} />,
          document.body
        )}
      <div
        role="button"
        onClick={() => {
          if (!editing) onSelect?.();
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          if (!editing) setEditing(true);
        }}
        className="group w-full text-left flex items-stretch rounded-lg border shadow-sm bg-white overflow-hidden hover:shadow-md transition cursor-grab relative"
        style={{ zIndex: editing ? 50 : undefined }}
      >
        {/* main content */}
        <div className={`flex-1 p-3 flex flex-col ${twBg ?? ''}`}>
          {/* image */}
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={title}
              width={400}
              height={200}
              unoptimized
              className="h-30 mb-2 rounded-lg w-full object-cover"
            />
          )}

          {/* title or inline editor */}
          {editing ? (
            <div className="space-y-2">
              <input
                ref={inputRef}
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    save();
                  }
                }}
                className="w-full bg-background px-2 py-1 text-sm"
              />
            </div>
          ) : (
            <h4 className="font-medium">{title.trim() ? title : EMPTY_ACTIVITY_TITLE}</h4>
          )}

          {/* Conditionally render schedule and duration only if at least one exists */}
          {isMounted && (startTime?.trim() || duration! > 0) && (
            <div className="flex gap-6 text-sm">
              {/* Conditionally render start time */}
              {startTime?.trim() && (
                <span className="inline-flex items-center gap-2">
                  <Clock size={12} />
                  {startTime}
                </span>
              )}
              {/* Conditionally render duration */}
              {duration! > 0 && (
                <span className="inline-flex items-center gap-2">
                  <Hourglass size={12} />
                  {duration}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Update Button Outside */}
      {editing && (
        <div className="relative pt-4 z-50">
          <Button type="button" size="sm" className="cursor-pointer" onClick={save}>
            Update
          </Button>
        </div>
      )}
    </>
  );
}
