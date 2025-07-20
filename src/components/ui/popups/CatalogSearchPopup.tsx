// src/components/ui/popups/CatalogSearchPopup.tsx
'use client';

import React, { useRef } from 'react';
import FocusTrap from 'focus-trap-react';
import { CloseButton, Spinner } from '@/components';
import { usePopupOutsideHandler, useEscapeKey, useDestinationCatalog } from '@/hooks';
import type { CatalogActivity } from '@/types';

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
  const popupRef = useRef<HTMLDivElement>(null);

  const { visibleItems, search, setSearch, loading, error } = useDestinationCatalog(open);

  usePopupOutsideHandler({ popupRef, triggerRef, onClose, isOpen: open });
  useEscapeKey({ onClose, isActive: open, triggerRef });

  if (!open) return null;

  return (
    <FocusTrap
      active={open}
      focusTrapOptions={{
        clickOutsideDeactivates: true,
        escapeDeactivates: false,
      }}
    >
      <div
        ref={popupRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="catalog-search-popup-title"
        tabIndex={-1}
        className="w-72 bg-[var(--background)] rounded-lg shadow-xl focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h3 id="catalog-search-popup-title" className="font-bold">
            Search Catalog
          </h3>
          <CloseButton onClick={onClose} />
        </div>
        <div className="p-2 space-y-2">
          <input
            id="catalog-search-input"
            name="search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="w-full border rounded px-2 py-1 text-sm"
          />
          {loading && (
            <div className="flex items-center gap-2 text-sm">
              <Spinner className="size-4" />
              <span>Loading...</span>
            </div>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
          {!loading && !error && (
            <ul className="max-h-60 overflow-y-auto space-y-1">
              {visibleItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="w-full text-left rounded px-2 py-1 hover:bg-accent"
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
      </div>
    </FocusTrap>
  );
}
