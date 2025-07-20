// src/components/planner/modal/ActivityModalForm.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { AlignLeft } from 'lucide-react';
import { DollarSign, Hourglass } from 'lucide-react';

import type { Activity } from '@/types';
import { EMPTY_ACTIVITY_TITLE } from '@/constants';
import { UpdateButton, Input } from '@/components';

interface ActivityModalFormProps {
  activity: Activity;
  onSave: (draft: Partial<Activity>) => void;
  color: string;
}

export default function ActivityModalForm({ activity, onSave, color }: ActivityModalFormProps) {
  const [editedTitle, setEditedTitle] = useState(activity.title);
  const [editedDescription, setEditedDescription] = useState(activity.description ?? '');
  const [duration, setDuration] = useState<number>(activity.duration || 0);
  const [budget, setBudget] = useState<number>(activity.budget || 0);

  // Update internal state when the activity prop changes
  useEffect(() => {
    setEditedTitle(activity.title);
    setEditedDescription(activity.description ?? '');
    setDuration(activity.duration || 0);
    setBudget(activity.budget || 0);
  }, [activity]);

  // Automatically focus the title input only when the activity title is empty.
  const titleInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (titleInputRef.current && !editedTitle.trim()) {
      titleInputRef.current.focus();
    }
  }, [editedTitle]);

  return (
    <>
      {/* Editable title */}
      <label htmlFor="title" className="sr-only">
        Title
      </label>
      <input
        id="title"
        name="title"
        ref={titleInputRef}
        value={editedTitle}
        onChange={(e) => setEditedTitle(e.target.value)}
        placeholder={EMPTY_ACTIVITY_TITLE}
        required
        aria-required="true"
        className="content-center font-bold rounded mx-4 mb-4 px-2 py-2 text-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      />

      {/* Duration & Budget group */}
      <fieldset className="px-4 mb-4 flex gap-2" aria-labelledby="time-budget-legend">
        <legend id="time-budget-legend" className="sr-only">
          Duration and Budget
        </legend>

        {/* Duration */}
        <Input
          labelId="duration"
          value={duration === 0 ? '' : String(duration)}
          onValueChange={(val) => setDuration(Number(val))}
          aria-label="Duration in hours"
          inputSize="sm"
          background="default"
          type="number"
          placeholder="Hrs"
          icon={<Hourglass size={14} aria-hidden="true" className="text-muted-foreground" />}
          className="text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          autoComplete="off"
          min={0}
        />

        {/* Budget */}
        <Input
          labelId="budget"
          value={budget === 0 ? '' : String(budget)}
          onValueChange={(val) => setBudget(Number(val))}
          aria-label="Budget amount"
          type="number"
          inputSize="default"
          background="default"
          icon={<DollarSign size={14} aria-hidden="true" className="text-muted-foreground" />}
          placeholder="Budget"
          min={0}
          autoComplete="off"
          className="text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        />
      </fieldset>

      {/* Notes */}
      <div className="px-4">
        <label htmlFor="activity-notes" className="text-xs font-bold flex items-center gap-1">
          <AlignLeft size={12} aria-hidden="true" />
          <span>Notes</span>
        </label>
        <textarea
          id="activity-notes"
          name="notes"
          value={editedDescription}
          onChange={(e) => setEditedDescription(e.target.value)}
          placeholder="Add a more detailed description."
          rows={3}
          className="w-full rounded p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        />
      </div>

      {/* Update */}
      <div className="px-4 py-3 flex justify-center gap-2">
        <UpdateButton
          type="button"
          ready={Boolean(editedTitle.trim())}
          aria-disabled={!Boolean(editedTitle.trim())}
          onClick={() =>
            onSave({
              title: editedTitle.trim(),
              description: editedDescription,
              color,
              duration: Number(duration),
              budget,
              imageUrl: activity.imageUrl,
            })
          }
          className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Update
        </UpdateButton>
      </div>
    </>
  );
}
