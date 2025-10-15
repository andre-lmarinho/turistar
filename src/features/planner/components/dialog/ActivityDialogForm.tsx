'use client';

import React, { useEffect, useState, useRef } from 'react';
import { AlignLeft, MapPin, DollarSign, Hourglass } from '@/shared/ui/icon';

import type { Activity } from '@/features/planner/domain/types/PlannerEntities';
import { EMPTY_ACTIVITY_TITLE } from '@/features/planner/domain/constants/activity';
import { LocationSearchInput } from '../../ui/input/LocationSearchInput';
import { useAddressAutocomplete } from '@/features/planner/hooks/search/useAddressAutocomplete';
import { usePlannerContext } from '@/features/planner/hooks/PlannerContext';

interface ActivityDialogFormProps {
  activity: Activity;
  onSave: (draft: Partial<Activity>) => void;
  color: string;
}

export function ActivityDialogForm({ activity, onSave, color }: ActivityDialogFormProps) {
  const [editedTitle, setEditedTitle] = useState(activity.title ?? '');
  const [editedDescription, setEditedDescription] = useState(activity.description ?? '');
  const [duration, setDuration] = useState<number>(activity.duration || 0);
  const [budget, setBudget] = useState<number>(activity.budget || 0);
  const [address, setAddress] = useState(activity.address ?? '');
  const [latitude, setLatitude] = useState<number | undefined>(activity.latitude);
  const [longitude, setLongitude] = useState<number | undefined>(activity.longitude);
  const { destCoords } = usePlannerContext();

  // Update internal state when the activity prop changes
  useEffect(() => {
    setEditedTitle(activity.title ?? '');
    setEditedDescription(activity.description ?? '');
    setDuration(activity.duration || 0);
    setBudget(activity.budget || 0);
    setAddress(activity.address ?? '');
    setLatitude(activity.latitude);
    setLongitude(activity.longitude);
  }, [activity]);

  // Automatically scroll to the title input only once when the initial title is empty.
  const titleInputRef = useRef<HTMLInputElement>(null);
  const initialTitle = useRef(editedTitle);

  useEffect(() => {
    if (!initialTitle.current.trim()) {
      titleInputRef.current?.scrollIntoView({ block: 'center' });
    }
  }, []);

  async function handleSave() {
    let lat = latitude;
    let lng = longitude;
    const addr = address.trim();

    if (addr && (lat === undefined || lng === undefined)) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}`
        );
        const data: Array<{ lat: string; lon: string }> = await res.json();
        if (data[0]) {
          lat = parseFloat(data[0].lat);
          lng = parseFloat(data[0].lon);
        }
      } catch {
        // Geocoding failures are non-blocking; coordinates remain as provided
      }
    }

    onSave({
      title: editedTitle.trim(),
      description: editedDescription,
      color,
      duration: Number(duration),
      budget,
      imageUrl: activity.imageUrl,
      address: addr || undefined,
      latitude: lat,
      longitude: lng,
    });
  }

  const canSave = Boolean(editedTitle.trim());

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

      {/* Duration & Budget group */}
      <fieldset className="mb-4 flex gap-2 px-4" aria-labelledby="time-budget-legend">
        <legend id="time-budget-legend" className="sr-only">
          Duration and Budget
        </legend>

        {/* Duration */}
        <div>
          <label htmlFor="duration" className="mb-1 flex items-center gap-1 text-xs font-bold">
            <Hourglass size={12} aria-hidden="true" />
            <span>Duration</span>
          </label>
          <input
            id="duration"
            value={duration === 0 ? '' : String(duration)}
            onChange={(event) => setDuration(Number(event.target.value))}
            aria-label="Duration in hours"
            type="number"
            placeholder="Hrs"
            className="focus:ring-primary w-22 rounded border px-2 py-1 text-right text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
            autoComplete="off"
            min={0}
            inputMode="decimal"
          />
        </div>
        {/* Budget */}
        <div>
          <label htmlFor="budget" className="mb-1 flex items-center gap-1 text-xs font-bold">
            <DollarSign size={12} aria-hidden="true" />
            <span>Budget</span>
          </label>
          <input
            id="budget"
            value={budget === 0 ? '' : String(budget)}
            onChange={(event) => setBudget(Number(event.target.value))}
            aria-label="Budget amount"
            type="number"
            placeholder="Budget"
            className="focus:ring-primary w-22 rounded border px-2 py-1 text-right text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
            min={0}
            autoComplete="off"
            inputMode="decimal"
          />
        </div>
      </fieldset>

      {/* Location */}
      <div className="mb-2 px-4">
        <label
          htmlFor="activity-address"
          className="mb-1 flex items-center gap-1 text-xs font-bold"
        >
          <MapPin size={12} aria-hidden="true" />
          <span>Address</span>
        </label>
        <LocationSearchInput
          id="activity-address"
          value={address}
          onChange={(val) => {
            if (typeof val === 'string') {
              setAddress(val);
              setLatitude(undefined);
              setLongitude(undefined);
            } else {
              setAddress(val.name);
              setLatitude(val.latitude);
              setLongitude(val.longitude);
            }
          }}
          placeholder="Search address"
          className="w-full"
          inputClassName="focus:ring-primary w-full rounded p-1 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
          latitude={destCoords?.lat}
          longitude={destCoords?.lng}
          autocompleteHook={useAddressAutocomplete}
        />
      </div>

      {/* Notes */}
      <div className="mb-2 px-4">
        <label htmlFor="activity-notes" className="mb-1 flex items-center gap-1 text-xs font-bold">
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
          className="focus:ring-primary w-full resize-none rounded p-1 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
        />
      </div>

      {/* Update */}
      <div className="flex justify-center gap-2 pb-4">
        <button
          type="button"
          disabled={!canSave}
          onClick={handleSave}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          Update
        </button>
      </div>
    </>
  );
}
