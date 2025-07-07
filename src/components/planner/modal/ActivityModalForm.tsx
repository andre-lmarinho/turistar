// src/components/planner/modal/ActivityModalForm.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import ActivityHeaderCard from '@/components/planner/modal/ActivityHeaderCard';
import type { Activity } from '@/types/itinerary';
import { EMPTY_ACTIVITY_TITLE } from '@/constants/ui';
import { AlignLeft } from 'lucide-react';

interface ActivityModalFormProps {
  activity: Activity;
  onClose: () => void;
  onSave: (draft: Partial<Activity>) => void;
  color: string;
}

export default function ActivityModalForm({ activity, onSave, color }: ActivityModalFormProps) {
  const [editedTitle, setEditedTitle] = useState(activity.title);
  const [editedDescription, setEditedDescription] = useState(activity.description ?? '');
  const [when, setWhen] = useState(activity.startTime ?? '');
  const [duration, setDuration] = useState<number>(activity.duration || 0);

  /**
   * Automatically focus the title input only when the activity title is empty.
   */
  const titleInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (titleInputRef.current && !editedTitle.trim()) {
      titleInputRef.current.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Image if have it */}
      <div className="p-4">
        <ActivityHeaderCard
          name={editedTitle.trim() || EMPTY_ACTIVITY_TITLE}
          imageUrl={activity.imageUrl}
        />
      </div>

      {/* Editable title, description, when & duration */}

      <input
        ref={titleInputRef}
        value={editedTitle}
        onChange={(e) => setEditedTitle(e.target.value)}
        placeholder={EMPTY_ACTIVITY_TITLE}
        className="content-center font-bold rounded mx-4 px-2 py-2 text-2xl"
      />

      <div className="p-6">
        <input
          type="time"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          className="flex-1 border rounded p-2 text-sm mr-4"
        />
        <input
          type="number"
          min={0}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          placeholder="min"
          className="w-24 border rounded px-3 py-2 text-sm"
        />
      </div>

      <div className="px-4">
        <label className="p-2 text-xs font-bold flex items-center gap-1 cursor-pointer">
          <AlignLeft size={12} />
          <span>Notes</span>
        </label>
        <textarea
          value={editedDescription}
          onChange={(e) => setEditedDescription(e.target.value)}
          placeholder="Description"
          rows={3}
          className="w-full border rounded p-2 text-sm resize-none"
        />
      </div>

      {/* Footer: Cancel & Update */}
      <div className="px-4 py-3 flex justify-center gap-2">
        <button
          onClick={() =>
            onSave({
              title: editedTitle.trim(),
              description: editedDescription,
              color,
              startTime: when,
              duration: Number(duration),
            })
          }
          className={`px-4 py-2 rounded text-sm ${
            editedTitle.trim()
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!editedTitle.trim()}
        >
          Update
        </button>
      </div>
    </>
  );
}
