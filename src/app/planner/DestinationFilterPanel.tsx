"use client"; // ← garante que podemos usar useState/useEffect

import React, { useState, useEffect } from "react";
import DestinationCard from "./DestinationCard";
import type { Activity } from "@/types/itinerary";

/* ----- Raw JSON type ----- */
interface RawActivity {
  id: string;
  name: string;
  type: string[];
  category: string;
  duration: number;
  lat: number;
  lng: number;
  price: string;
  tags: string[];
  description: string;
  imageUrl?: string;
}

interface DestinationFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Activity) => void;
  addedIds?: Set<string>;
}

export default function DestinationFilterPanel({
  isOpen,
  onClose,
  onAdd,
  addedIds = new Set<string>(),
}: DestinationFilterPanelProps) {
  const [items, setItems] = useState<RawActivity[]>([]);

  /* Fetch only once (first open) */
  useEffect(() => {
    if (!isOpen || items.length > 0) return;

    fetch("/api/itinerary?dest=salvador")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: { activities: RawActivity[] }) => setItems(data.activities))
      .catch(console.error);
  }, [isOpen, items.length]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Centered popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="relative w-[95vw] h-[95vh] max-w-[1350px] bg-white rounded-lg shadow-xl overflow-auto">
          {/* Close (X) */}
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
          >
            &times;
          </button>

          {/* Cards grid */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const isAdded = addedIds.has(item.id);
              return (
                <DestinationCard
                  key={item.id}
                  id={item.id}
                  title={item.name}
                  duration={item.duration}
                  price={item.price}
                  description={item.description}
                  added={isAdded}
                  onAdd={() => {
                    if (isAdded) return;
                    const { price: _omit, name, ...rest } = item;
                    onAdd({ ...rest, title: name });
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
