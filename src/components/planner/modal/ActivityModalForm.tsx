// src/components/planner/modal/ActivityModalForm.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import ActivityHeaderCard from '@/components/planner/card/ActivityHeaderCard';
import AutocompleteInput from '@/components/ui/AutocompleteInput';
import ColorSwatchPicker from '@/components/ui/ColorSwatchPicker';
import salvadorData from '@/data/salvador.json';
import type { Activity } from '@/types/itinerary';
import type { LocalPoi } from '@/utils/buildPoi';
import { buildPoi } from '@/utils/buildPoi';
import { EMPTY_ACTIVITY_TITLE } from '@/constants/ui';

interface ActivityModalFormProps {
  activity: Activity;
  poiOptions: string[];
  onClose: () => void;
  onSave: (draft: Partial<Activity>) => void;
  color: string;
  onColorChange: (color: string) => void;
}

export default function ActivityModalForm({
  activity,
  poiOptions,
  onSave,
  color,
  onColorChange,
}: ActivityModalFormProps) {
  const initialPoi = buildPoi(activity);

  const [selectedPoi, setSelectedPoi] = useState<LocalPoi>(initialPoi);
  const [editedTitle, setEditedTitle] = useState(selectedPoi.name);
  const [editedDescription, setEditedDescription] = useState(selectedPoi.description);
  const [when, setWhen] = useState(activity.startTime ?? '');
  const [duration, setDuration] = useState<number>(activity.duration || 0);
  const [search, setSearch] = useState('');

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
      {/* 1) Central POI card */}
      <div className="p-4">
        <ActivityHeaderCard name={selectedPoi.name} imageUrl={selectedPoi.imageUrl} />
      </div>

      {/* 2) Autocomplete: choose a new POI */}
      <div className="px-4 pb-4">
        <AutocompleteInput
          value={search}
          onChange={setSearch}
          options={poiOptions}
          onSelect={(name) => {
            setSearch(name);
            const poi = salvadorData.activities.find((p) => p.name === name)!;
            setSelectedPoi({
              id: poi.id,
              name: poi.name,
              description: poi.description,
              imageUrl: poi.image_url,
              duration: poi.duration,
            });
            setEditedTitle(poi.name);
            setEditedDescription(poi.description);
            setDuration(Number(poi.duration));
          }}
        />
      </div>

      {/* 3) Editable title, description, when & duration */}
      <div className="px-4 space-y-3 overflow-y-auto">
        <input
          ref={titleInputRef}
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          placeholder={EMPTY_ACTIVITY_TITLE}
          className="w-full border rounded px-3 py-2 text-sm"
        />
        <textarea
          value={editedDescription}
          onChange={(e) => setEditedDescription(e.target.value)}
          placeholder="Description"
          rows={3}
          className="w-full border rounded px-3 py-2 text-sm resize-none"
        />
        <div className="flex gap-2">
          <input
            type="time"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            className="flex-1 border rounded px-3 py-2 text-sm"
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
      </div>

      {/* 4) Color picker */}
      <div className="px-4 py-4 border-t">
        <ColorSwatchPicker value={color} onChange={onColorChange} />
      </div>

      {/* 5) Footer: Cancel & Update */}
      <div className="px-4 py-3 border-t flex justify-end gap-2">
        <button
          onClick={() =>
            onSave({
              title: editedTitle.trim(),
              description: editedDescription,
              color,
              startTime: when,
              duration: Number(duration),
              imageUrl: selectedPoi.imageUrl,
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
