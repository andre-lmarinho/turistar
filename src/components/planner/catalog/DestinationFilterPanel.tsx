import React, { useState } from 'react';
import DestinationHeader from '@/components/planner/catalog/DestinationHeader';
import DestinationCardGrid from '@/components/planner/catalog/DestinationCardGrid';
import ConfigSidebar from '@/components/planner/catalog/ConfigSidebar';
import { useDestinationCatalog } from '@/hooks/useDestinationCatalog';
import type { Activity } from '@/types/itinerary';

interface DestinationFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (a: Activity) => void;
  onRemove: (id: string) => void;
  addedIds?: Set<string>;
}

export default function DestinationFilterPanel({
  isOpen,
  onClose,
  onAdd,
  onRemove,
  addedIds = new Set<string>(),
}: DestinationFilterPanelProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { visibleItems, categories, sortMode, setSortMode, toggleCat, loading, error } =
    useDestinationCatalog(isOpen);

  if (!isOpen) return null;

  return (
    <>
      {/* backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="relative w-[95vw] h-[95vh] max-w-[1350px] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
          {/* header rows */}
          <DestinationHeader
            city={'salvador'}
            onChangeCity={() => {}}
            categories={categories}
            activeCats={new Set()}
            toggleCat={toggleCat}
            sortMode={sortMode}
            setSortMode={setSortMode}
            onToggleSidebar={() => setSidebarOpen((o) => !o)}
            onClose={onClose}
          />

          {/* sidebar + cards */}
          <div className="flex-1 flex overflow-auto">
            <ConfigSidebar open={sidebarOpen} />

            <div className="flex-1 p-6">
              {loading && <p>Loading catalog...</p>}
              {error && <p className="text-red-500">{error}</p>}
              {!loading && !error && (
                <DestinationCardGrid
                  items={visibleItems}
                  addedIds={addedIds}
                  onAdd={onAdd}
                  onRemove={onRemove}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
