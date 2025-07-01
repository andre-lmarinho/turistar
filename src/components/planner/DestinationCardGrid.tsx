"use client";

import React from "react";
import DestinationCard from "./DestinationCard";
import type { Activity } from "@/types/itinerary";

/* Raw shape used in the filter panel */
export interface RawActivity {
  id: string;
  name: string;
  duration: number;
  price: string;
  description: string;
  /* the rest of the JSON fields are ignored here */
}

interface Props {
  items: RawActivity[];
  addedIds: Set<string>;
  onAdd: (a: Activity) => void;
}

export default function DestinationCardGrid({ items, addedIds, onAdd }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              /* convert on click → Activity */
              const { price: _omit, name, ...rest } = item;
              onAdd({ ...rest, title: name } as Activity);
            }}
          />
        );
      })}
    </div>
  );
}
