// src/components/planner/catalog/ResultsList.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { DestinationCardGrid, Spinner } from '@/components';
import type { CatalogActivity } from '@/types';

interface ResultsListProps {
  items: CatalogActivity[];
  addedIds: Set<string>;
  loading: boolean;
  error?: string;
  onAdd: (a: CatalogActivity) => void;
  onRemove: (id: string) => void;
}

export default function ResultsList({
  items,
  addedIds,
  loading,
  error,
  onAdd,
  onRemove,
}: ResultsListProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const scrollPosRef = useRef(0);

  const handleAdd = (a: CatalogActivity) => {
    scrollPosRef.current = scrollRef.current?.scrollTop ?? 0;
    onAdd(a);
  };

  const handleRemove = (id: string) => {
    scrollPosRef.current = scrollRef.current?.scrollTop ?? 0;
    onRemove(id);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollPosRef.current;
    }
  }, [addedIds]);

  return (
    <div className="flex flex-1 overflow-auto" ref={scrollRef}>
      <div className="flex-1 p-4">
        {loading && (
          <div className="flex items-center gap-2">
            <Spinner />
            <span>Loading catalog...</span>
          </div>
        )}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          <DestinationCardGrid
            items={items}
            addedIds={addedIds}
            onAdd={handleAdd}
            onRemove={handleRemove}
          />
        )}
      </div>
    </div>
  );
}
