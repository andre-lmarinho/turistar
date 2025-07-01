// src/app/planner/DestinationFilterPanel.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import DestinationCard from "./DestinationCard";
import CloseButton from "./CloseButton";
import CitySwitcher from "./CitySwitcher";
import CategoryFilterBar from "./CategoryFilterBar";
import SortSelector, { sortModes, SortMode } from "./SortSelector";
import ConfigSidebar from "./ConfigSidebar";
import { FaSlidersH } from "react-icons/fa";
import type { Activity } from "@/types/itinerary";

/* Raw JSON shape */
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

  /*──────── derived data (always call hooks!) ────────*/
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
    {/* Backdrop */}
    <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

    {/* Popup panel */}
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Outer shell */}
      <div className="relative w-[95vw] h-[95vh] max-w-[1350px] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
        {/* Row 1 — city switcher + close */}
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <CitySwitcher city={city} onChangeCity={setCity} />
          <CloseButton onClick={onClose} />
        </div>

        {/* Row 2 — settings btn | categories | sorter */}
        <div className="flex items-center justify-between px-4 py-2 border-b gap-2">
          <button
            title="Toggle config"
            onClick={() => setSidebarOpen((o) => !o)}
            className="text-xl text-gray-600 hover:text-gray-800 transition-transform duration-300 transform hover:scale-110 hover:-rotate-90"
          >
            <FaSlidersH />
          </button>

          <div className="flex-1 overflow-x-auto">
            <CategoryFilterBar
              categories={categories}
              active={activeCats}
              onToggle={toggleCat}
            />
          </div>

          <SortSelector value={sortMode} onChange={setSortMode} />
        </div>

        {/* Row 3 — sidebar (if open) + cards */}
        <div className="flex-1 flex overflow-auto">
          {/* collapsible sidebar now lives ONLY in row 3 */}
          <ConfigSidebar open={sidebarOpen} />

          {/* card grid */}
          <div className="flex-1 p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleItems.map((item) => {
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
      </div>
    </div>
  </>
);
}
