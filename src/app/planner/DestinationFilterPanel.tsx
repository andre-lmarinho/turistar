// src/app/planner/DestinationFilterPanel.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import DestinationHeader from "@/components/planner/DestinationHeader";
import DestinationCardGrid from "@/components/planner/DestinationCardGrid";
import ConfigSidebar from "@/components/planner/ConfigSidebar";
import { SortMode } from "@/components/planner/SortSelector";
import type { Activity } from "@/types/itinerary";

/* --- Raw JSON shape ------------------------------------------------------- */
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
  onAdd: (a: Activity) => void;
  addedIds?: Set<string>;
}

/* ------------------------------------------------------------------------- */
export default function DestinationFilterPanel({
  isOpen,
  onClose,
  onAdd,
  addedIds = new Set<string>(),
}: DestinationFilterPanelProps) {
  /*──────── state ────────*/
  const [items, setItems] = useState<RawActivity[]>([]);
  const [city, setCity] = useState("salvador");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCats, setActiveCats] = useState<Set<string>>(new Set());
  const [sortMode, setSortMode] = useState<SortMode>("A-Z");

  /*──────── fetch ────────*/
  useEffect(() => {
    if (!isOpen || items.length > 0) return;

    fetch(`/api/itinerary?dest=${city}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: { activities: RawActivity[] }) => setItems(data.activities))
      .catch(console.error);
  }, [isOpen, city, items.length]);

  /*──────── derived lists (always call hooks) ────────*/
  const categories = useMemo(
    () => [...new Set(items.map((i) => i.category))],
    [items]
  );

  const visibleItems = useMemo(() => {
    const filtered =
      activeCats.size === 0
        ? items
        : items.filter((it) => activeCats.has(it.category));

    return [...filtered].sort((a, b) => {
      switch (sortMode) {
        case "Price":
          return a.price.localeCompare(b.price);
        case "Duration":
          return a.duration - b.duration;
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [items, activeCats, sortMode]);

  /*──────── helpers ────────*/
  const toggleCat = (cat: string) =>
    setActiveCats((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });

  /*──────── early return AFTER hooks ────────*/
  if (!isOpen) return null;

  /*──────── UI ────────*/
  return (
    <>
      {/* backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* popup container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="relative w-[95vw] h-[95vh] max-w-[1350px] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
          {/* header rows 1 & 2 */}
          <DestinationHeader
            city={city}
            onChangeCity={setCity}
            categories={categories}
            activeCats={activeCats}
            toggleCat={toggleCat}
            sortMode={sortMode}
            setSortMode={setSortMode}
            onToggleSidebar={() => setSidebarOpen((o) => !o)}
            onClose={onClose}
          />

          {/* row 3: sidebar + card grid */}
          <div className="flex-1 flex overflow-auto">
            <ConfigSidebar open={sidebarOpen} />

            {/* cards */}
            <div className="flex-1 p-6">
              <DestinationCardGrid
                items={visibleItems}
                addedIds={addedIds}
                onAdd={onAdd}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
