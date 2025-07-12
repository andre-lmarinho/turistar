// src/components/planner/modal/ActivityModalForm.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { AlignLeft } from 'lucide-react';
import { DollarSign, Clock } from 'lucide-react';

import type { Activity } from '@/types';
import { EMPTY_ACTIVITY_TITLE } from '@/constants';

interface ActivityModalFormProps {
  activity: Activity;
  onClose: () => void;
  onSave: (draft: Partial<Activity>) => void;
  color: string;
}

export default function ActivityModalForm({ activity, onSave, color }: ActivityModalFormProps) {
  const [editedTitle, setEditedTitle] = useState(activity.title);
  const [editedDescription, setEditedDescription] = useState(activity.description ?? '');
  const [duration, setDuration] = useState<number>(activity.duration || 0);
  const [budget, setBudget] = useState<number>(activity.budget || 0);

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
      {/* Editable title, description, when & duration */}
      <input
        ref={titleInputRef}
        value={editedTitle}
        onChange={(e) => setEditedTitle(e.target.value)}
        placeholder={EMPTY_ACTIVITY_TITLE}
        className="content-center font-bold rounded mx-4 mb-4 px-2 py-2 text-2xl"
      />

      <div className="px-4 mb-4 flex gap-2">
        {/* Duration */}
        <div className="relative w-28">
          <label
            htmlFor="duration"
            className={`absolute left-2 top-2 text-xs font-semibold text-muted-foreground transition-all duration-200 pointer-events-none ${
              duration ? 'translate-y-[-1.5rem] text-[12px]' : 'translate-y-2 opacity-0'
            }`}
          >
            Duration
          </label>

          <div className="flex hover:bg-gray-50 items-center border rounded px-2 py-1 bg-background focus-within:ring-2 ring-primary">
            <Clock size={14} className="text-muted-foreground mr-1" />
            <input
              id="duration"
              type="number"
              min={0}
              value={duration === 0 ? '' : duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              placeholder="Duration"
              className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Budget */}
        <div className="relative w-28 ">
          <label
            htmlFor="budget"
            className={`absolute left-2 top-2 text-xs font-semibold text-muted-foreground transition-all duration-200 pointer-events-none ${
              budget ? 'translate-y-[-1.5rem] text-[12px]' : 'translate-y-2 opacity-0'
            }`}
          >
            Budget
          </label>
          <div className="flex hover:bg-gray-50 items-center border rounded px-2 py-1 bg-background focus-within:ring-2 ring-primary">
            <DollarSign size={14} className="text-muted-foreground mr-1" />
            <input
              id="budget"
              type="number"
              value={budget === 0 ? '' : budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              placeholder="Budget"
              className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground"
              min={0}
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="px-4">
        <label className="text-xs font-bold flex items-center gap-1">
          <AlignLeft size={12} />
          <span>Notes</span>
        </label>
        <textarea
          value={editedDescription}
          onChange={(e) => setEditedDescription(e.target.value)}
          placeholder="Add a more detailed description."
          rows={3}
          className="w-full  rounded p-2 text-sm resize-none"
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
              duration: Number(duration),
              budget,
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
