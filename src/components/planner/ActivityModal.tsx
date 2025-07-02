// src/components/planner/ActivityModal.tsx
"use client";

import React, { useState } from "react";
import ReactDOM from "react-dom";
import ActivityModalHeader from "@/components/planner/ActivityModalHeader";
import ActivityHeaderCard from "@/components/planner/ActivityHeaderCard";
import AutocompleteInput from "@/components/ui/AutocompleteInput";
import ColorSwatchPicker from "@/components/ui/ColorSwatchPicker";
import salvadorData from "@/data/salvador.json";
import type { Activity } from "@/types/itinerary";

/**
 * A simplified local type for POIs coming from salvador.json
 * (the JSON has no `imageUrl` field, so we always set it undefined here).
 */
interface LocalPoi {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  duration: number;
}

interface ActivityModalProps {
  open: boolean;
  activity: Activity;
  poiOptions: string[];
  onClose: () => void;
  onDelete: () => void;
  onSave: (draft: Partial<Activity>) => void;
}

export default function ActivityModal({
  open,
  activity,
  poiOptions,
  onClose,
  onDelete,
  onSave,
}: ActivityModalProps) {
  if (!open) return null;

  // Build initial LocalPoi from JSON or fallback to board's activity
  const initialPoi: LocalPoi = (() => {
    const found = salvadorData.activities.find((p) => p.id === activity.id);
    if (found) {
      return {
        id: found.id,
        name: found.name,
        description: found.description,
        imageUrl: undefined,
        duration: found.duration,
      };
    }
    return {
      id: activity.id,
      name: activity.title,
      description: activity.description ?? "",
      imageUrl: undefined,
      duration: activity.duration,
    };
  })();

  // Separate JSON-backed selection vs. user edits
  const [selectedPoi, setSelectedPoi] = useState<LocalPoi>(initialPoi);
  const [editedTitle, setEditedTitle] = useState(selectedPoi.name);
  const [editedDescription, setEditedDescription] = useState(
    selectedPoi.description
  );
  const [color, setColor] = useState<string>(activity.color ?? "bg-gray-700");
  const [when, setWhen] = useState(activity.startTime ?? "");
  const [duration, setDuration] = useState(String(activity.duration));
  const [search, setSearch] = useState("");

  return ReactDOM.createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="w-[95vw] max-w-[800px] max-h-[95vh] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">
          {/* 1) Header with color stripe, delete & close */}
          <ActivityModalHeader
            bgColor={color}
            onDelete={onDelete}
            onClose={onClose}
          />

          {/* 2) Central POI card */}
          <div className="p-4">
            <ActivityHeaderCard
              name={selectedPoi.name}
              imageUrl={selectedPoi.imageUrl}
            />
          </div>

          {/* 3) Autocomplete: choose a new POI */}
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

          {/* 4) Editable title, description, when & duration */}
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

          {/* 5) Color picker */}
          <div className="px-4 py-4 border-t">
            <ColorSwatchPicker value={color} onChange={setColor} />
          </div>

          {/* 6) Footer: Cancel & Update */}
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
        </div>
      </div>
    </>,
    document.body
  );
}
