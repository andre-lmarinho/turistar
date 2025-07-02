// src/components/planner/ActivityModal.tsx
"use client";

import React from "react";
import ReactDOM from "react-dom";
import ActivityModalHeader from "@/components/planner/ActivityModalHeader";
import ActivityModalForm from "@/components/planner/ActivityModalForm";
import type { Activity } from "@/types/itinerary";

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
          {/* Header */}
          <ActivityModalHeader
            bgColor={activity.color ?? "bg-gray-700"}
            onDelete={onDelete}
            onClose={onClose}
          />

          {/* Form */}
          <ActivityModalForm
            activity={activity}
            poiOptions={poiOptions}
            onClose={onClose}
            onSave={onSave}
          />
        </div>
      </div>
    </>,
    document.body
  );
}
