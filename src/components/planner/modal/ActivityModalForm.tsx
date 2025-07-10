// src/components/planner/modal/ActivityModalForm.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { AlignLeft } from 'lucide-react';

import { ActivityHeaderCard } from '@/components';
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
  const [when, setWhen] = useState(activity.startTime ?? '');
  const [duration, setDuration] = useState<number>(activity.duration || 0);
  const [editedImageUrl, setEditedImageUrl] = useState(activity.imageUrl ?? '');
  const [budget, setBudget] = useState<number>(activity.budget || 0);
  const [category, setCategory] = useState(activity.category ?? '');

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
      <div className="p-4 space-y-2">
        <ActivityHeaderCard
          name={editedTitle.trim() || EMPTY_ACTIVITY_TITLE}
          imageUrl={activity.imageUrl}
        />
        {editedImageUrl && (
          <button
            type="button"
            className="text-sm text-red-600 underline"
            onClick={() => setEditedImageUrl('')}
          >
            Remove photo
          </button>
        )}
        <input
          type="text"
          placeholder="Image URL"
          value={editedImageUrl}
          onChange={(e) => setEditedImageUrl(e.target.value)}
          className="w-full border rounded p-2 text-sm"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onloadend = () => {
              if (reader.result) setEditedImageUrl(String(reader.result));
            };
            reader.readAsDataURL(file);
          }}
          className="mt-2 text-sm"
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

      <div>
        <input
          value={budget}
          min={0}
          onChange={(e) => setBudget(Number(e.target.value))}
          placeholder="Budget"
          className="flex-1 border rouded p-2 text-sm mr-4"
        />
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
          className="flex-1 border rouded p-2 text-sm"
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
              imageUrl: editedImageUrl.trim() || undefined,
              budget,
              category,
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
