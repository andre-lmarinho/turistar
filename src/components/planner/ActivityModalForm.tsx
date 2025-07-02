// src/components/planner/ActivityModalForm.tsx
"use client";

import React, { useState } from "react";
import ActivityHeaderCard from "@/components/planner/ActivityHeaderCard";
import AutocompleteInput from "@/components/ui/AutocompleteInput";
import ColorSwatchPicker from "@/components/ui/ColorSwatchPicker";
import salvadorData from "@/data/salvador.json";
import type { Activity } from "@/types/itinerary";
import type { LocalPoi } from "@/utils/buildPoi";
import { buildPoi } from "@/utils/buildPoi";

interface ActivityModalFormProps {
  activity: Activity;
  poiOptions: string[];
  onClose: () => void;
  onSave: (draft: Partial<Activity>) => void;
}

export default function ActivityModalForm({
  activity,
  poiOptions,
  onClose,
  onSave,
}: ActivityModalFormProps) {
  const initialPoi = buildPoi(activity);

  const [selectedPoi, setSelectedPoi] = useState<LocalPoi>(initialPoi);
  const [editedTitle, setEditedTitle] = useState(selectedPoi.name);
  const [editedDescription, setEditedDescription] = useState(
    selectedPoi.description
  );
  const [color, setColor] = useState<string>(activity.color ?? "bg-gray-700");
  const [when, setWhen] = useState(activity.startTime ?? "");
  const [duration, setDuration] = useState(String(activity.duration));
  const [search, setSearch] = useState("");

  return (
    <>
      {/* 1) Central POI card */}
      <div className="p-4">
        <ActivityHeaderCard
          name={selectedPoi.name}
          imageUrl={selectedPoi.imageUrl}
        />
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
              imageUrl: undefined,
              duration: poi.duration,
            });
            setEditedTitle(poi.name);
            setEditedDescription(poi.description);
            setDuration(String(poi.duration));
          }}
        />
      </div>

      {/* 3) Editable title, description, when & duration */}
      <div className="px-4 space-y-3 overflow-y-auto">
        <input
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          placeholder="Activity title"
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
            onChange={(e) => setDuration(e.target.value)}
            placeholder="min"
            className="w-24 border rounded px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* 4) Color picker */}
      <div className="px-4 py-4 border-t">
        <ColorSwatchPicker value={color} onChange={setColor} />
      </div>

      {/* 5) Footer: Cancel & Update */}
      <div className="px-4 py-3 border-t flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded border text-sm"
        >
          Cancel
        </button>
        <button
          onClick={() =>
            onSave({
              title: editedTitle,
              description: editedDescription,
              color,
              startTime: when,
              duration: Number(duration),
            })
          }
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Update
        </button>
      </div>
    </>
  );
}
