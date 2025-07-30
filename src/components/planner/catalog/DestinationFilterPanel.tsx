// src/components/planner/catalog/DestinationFilterPanel.tsx
'use client';

import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import FocusTrap from 'focus-trap-react';
import { CatalogHeader, CategorySelector, ResultsList } from '@/components';
import type { CatalogActivity } from '@/types';
import { useDestinationCatalog, useEscapeKey } from '@/hooks';

interface DestinationFilterPanelProps {
  isOpen: boolean;
  dest: string;
  onClose: () => void;
  onAdd: (a: CatalogActivity) => void; // Catalog items only
  onRemove: (id: string) => void;
  addedIds?: Set<string>;
}

/**
 * Catalog popup with filtering and sorting.
 * - Displays catalog items to add to the planner.
 * - Works exclusively with CatalogActivity data.
 */
export default function DestinationFilterPanel({
  isOpen,
  onClose,
  onAdd,
  onRemove,
  dest,
  addedIds = new Set<string>(),
}: DestinationFilterPanelProps) {
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const toggleCat = (cat: string) =>
    setSelectedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });

  const { visibleItems, loading, error, search, setSearch } = useDestinationCatalog(
    isOpen && submitted,
    Array.from(selectedCats),
    dest
  );

  useEscapeKey({ onClose, isActive: isOpen });

  const containerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="backdrop-overlay flex items-center justify-center" onClick={onClose}>
      <FocusTrap
        active={isOpen}
        focusTrapOptions={{
          clickOutsideDeactivates: true,
          escapeDeactivates: false,
          initialFocus: false,
          fallbackFocus: () => containerRef.current ?? document.body,
          returnFocusOnDeactivate: false,
          tabbableOptions: { displayCheck: 'none' },
        }}
      >
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="destination-filter-title"
          tabIndex={-1}
          className="bg-background focus:ring-primary relative flex h-[90vh] w-[95vw] max-w-[1350px] flex-col rounded-lg shadow-xl focus:ring-2 focus:outline-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* header */}
          <CatalogHeader search={search} onSearchChange={setSearch} onClose={onClose} />

          <CategorySelector
            active={selectedCats}
            onToggle={toggleCat}
            submitted={submitted}
            onSubmit={() => setSubmitted(true)}
            onBack={() => setSubmitted(false)}
          />

          {submitted && (
            <ResultsList
              items={visibleItems}
              addedIds={addedIds}
              loading={loading}
              error={error}
              onAdd={onAdd}
              onRemove={onRemove}
            />
          )}
        </div>
      </FocusTrap>
    </div>,
    document.body
  );
}
