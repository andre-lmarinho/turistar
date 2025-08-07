// src/shared/ui/popups/CatalogSearchPopup.tsx
'use client';

import React from 'react';
import { CloseButton, Spinner, Popup } from '@/shared/ui';
import { useCatalogActivities, usePlannerContext } from '@/features/planner';
import type { CatalogActivity } from '@/shared/types';

interface CatalogSearchPopupProps {
  open: boolean;
  onSelect: (item: CatalogActivity) => void;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement>;
}

export default function CatalogSearchPopup({
  open,
  onSelect,
  onClose,
  triggerRef,
}: CatalogSearchPopupProps) {
  const [search, setSearch] = React.useState('');
  const { planId, dest } = usePlannerContext();
  const {
    activities = [],
    isLoading,
    isError,
  } = useCatalogActivities(planId, dest, {
    enabled: open,
  });
  const results = React.useMemo(
    () => activities.filter((a) => a.name.toLowerCase().includes(search.toLowerCase())),
    [activities, search]
  );

  return (
    <Popup
      open={open}
      triggerRef={triggerRef}
      onClose={onClose}
      aria-labelledby="catalog-search-popup-title"
      size="md"
    >
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h3 id="catalog-search-popup-title" className="font-bold">
          Search Catalog
        </h3>
        <CloseButton onClick={onClose} />
      </div>
      <div className="space-y-2 p-2">
        <label htmlFor="catalog-search-input" className="sr-only">
          Search catalog
        </label>
        <input
          id="catalog-search-input"
          name="search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          className="w-full rounded border px-2 py-1 text-sm"
        />
        {isLoading && (
          <div className="flex items-center gap-2 text-sm">
            <Spinner className="size-4" />
            <span>Loading...</span>
          </div>
        )}
        {isError && <p className="text-sm text-red-500">Failed to load results.</p>}
        {!isLoading && !isError && (
          <ul className="max-h-60 space-y-1 overflow-y-auto">
            {results.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="hover:bg-accent w-full rounded px-2 py-1 text-left"
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                >
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Popup>
  );
}
