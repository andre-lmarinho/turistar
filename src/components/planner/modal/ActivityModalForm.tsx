// src/components/planner/modal/ActivityModalForm.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { AlignLeft } from 'lucide-react';
import { DollarSign, Hourglass } from 'lucide-react';

import type { Activity } from '@/types';
import { EMPTY_ACTIVITY_TITLE } from '@/constants';
import { UpdateButton, Input, Spinner } from '@/components';
import { useDebounce, useDestinationAutocomplete } from '@/hooks';

interface ActivityModalFormProps {
  activity: Activity;
  onSave: (draft: Partial<Activity>) => void;
  color: string;
}

export default function ActivityModalForm({ activity, onSave, color }: ActivityModalFormProps) {
  const [editedTitle, setEditedTitle] = useState(activity.title ?? '');
  const [editedDescription, setEditedDescription] = useState(activity.description ?? '');
  const [editedAddress, setEditedAddress] = useState(activity.address ?? '');
  const [duration, setDuration] = useState<number>(activity.duration || 0);
  const [budget, setBudget] = useState<number>(activity.budget || 0);
  const [editedImageUrl, setEditedImageUrl] = useState(activity.imageUrl ?? '');
  const [addressOpen, setAddressOpen] = useState(false);
  const debouncedAddress = useDebounce(editedAddress);
  const { results: addressResults, loading: addressLoading } = useDestinationAutocomplete(
    debouncedAddress,
    { enabled: addressOpen }
  );

  // Update internal state when the activity prop changes
  useEffect(() => {
    setEditedTitle(activity.title ?? '');
    setEditedDescription(activity.description ?? '');
    setEditedAddress(activity.address ?? '');
    setDuration(activity.duration || 0);
    setBudget(activity.budget || 0);
    setEditedImageUrl(activity.imageUrl ?? '');
  }, [activity]);

  // Automatically focus the title input only when the activity title is empty.
  const titleInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (titleInputRef.current && !editedTitle.trim()) {
      titleInputRef.current.focus();
    }
  });

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
        className="focus:ring-primary mx-4 mb-4 content-center rounded px-2 py-2 text-2xl font-bold focus:ring-2 focus:ring-offset-2 focus:outline-none"
      />

      {/* Address */}
      <div className="relative mx-4 mb-4">
        <label htmlFor="activity-address" className="mb-1 block text-xs font-bold">
          Address
        </label>
        <input
          id="activity-address"
          type="text"
          value={editedAddress}
          onChange={(e) => {
            setEditedAddress(e.target.value);
            setAddressOpen(true);
          }}
          onBlur={() => setAddressOpen(false)}
          className="focus:ring-primary w-full rounded px-2 py-1 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
          placeholder="Location"
          autoComplete="off"
        />
        {addressLoading && <Spinner className="absolute top-1 right-1 size-4" />}
        {addressOpen && addressResults.length > 0 && (
          <ul className="bg-background absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded border text-sm shadow">
            {addressResults.map((r) => (
              <li key={`${r.latitude}-${r.longitude}`}>
                <button
                  type="button"
                  className="hover:bg-accent w-full px-2 py-1 text-left"
                  onMouseDown={() => {
                    setEditedAddress(r.name);
                    setAddressOpen(false);
                  }}
                >
                  {r.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Duration & Budget group */}
      <fieldset className="mb-4 flex gap-2 px-4" aria-labelledby="time-budget-legend">
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
          className="focus:ring-primary text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
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
          className="focus:ring-primary text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
        />
      </fieldset>

      {/* Notes */}
      <div className="px-4">
        <label htmlFor="activity-notes" className="flex items-center gap-1 text-xs font-bold">
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
          className="focus:ring-primary w-full resize-none rounded p-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
        />
      </div>

      {/* Update */}
      <div className="flex justify-center gap-2 px-4 py-3">
        <UpdateButton
          type="button"
          ready={Boolean(editedTitle.trim())}
          aria-disabled={!Boolean(editedTitle.trim())}
          onClick={() =>
            onSave({
              title: editedTitle.trim(),
              description: editedDescription,
              address: editedAddress,
              color,
              duration: Number(duration),
              budget,
              imageUrl: editedImageUrl,
            })
          }
          className="focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none"
        >
          Update
        </UpdateButton>
      </div>
    </>
  );
}
