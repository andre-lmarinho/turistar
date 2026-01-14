import React from "react";
import { Check, X } from "@/shared/ui/icon";
import { cn } from "@/shared/utils/cn";

type FeatureItem = { id: string; label: string };
type FeatureGroup = { title: string; items: FeatureItem[] };

const GROUPS: FeatureGroup[] = [
  {
    title: "Planning features",
    items: [
      { id: "welcome_form", label: "Welcome form (dates)" },
      { id: "planner_board_dnd", label: "Planner board with drag-and-drop" },
      { id: "destination_search", label: "Destination search with autocomplete" },
      { id: "map_view", label: "Interactive map view" },
      { id: "persistent_storage", label: "Persistent storage on Supabase" },
      { id: "sample_plans", label: "Sample plans included" },
    ],
  },
  {
    title: "Realtime collaboration",
    items: [
      { id: "realtime_channel", label: "Supabase Realtime channel" },
      { id: "event_sourced", label: "Event-sourced model" },
      { id: "optimistic_updates", label: "Optimistic updates" },
      { id: "concurrency_control", label: "Concurrency control" },
      { id: "durable_snapshots", label: "Durable snapshots (replay)" },
    ],
  },
  {
    title: "Integrations",
    items: [
      { id: "geoapify", label: "Geoapify for attractions" },
      { id: "leaflet", label: "Leaflet / React-Leaflet" },
      { id: "dnd_kit", label: "DnD Kit for drag-and-drop" },
      { id: "supabase", label: "Supabase (DB + Realtime)" },
      { id: "nextjs", label: "Next.js (App Router)" },
    ],
  },
  {
    title: "Data management & security",
    items: [
      { id: "postgres_supabase", label: "PostgreSQL / Supabase base" },
      { id: "persistence_recovery", label: "Plan persistence & recovery" },
      { id: "event_versioning", label: "Event versioning" },
    ],
  },
  {
    title: "Accessibility & UX",
    items: [
      { id: "keyboard_accessible", label: "Keyboard accessible" },
      { id: "responsive_design", label: "Responsive design" },
      { id: "destinations_map_access", label: "Destination map view" },
    ],
  },
];

const MarkTrue = ({ last = false }: { last?: boolean }) => (
  <div
    className={cn(
      "bg-card absolute inset-x-0 top-0 bottom-0 -mt-px flex items-center justify-center border-x border-b font-medium",
      last && "-bottom-4 rounded-b-2xl"
    )}>
    <Check className="size-4 align-middle" aria-label="present" />
  </div>
);

const MarkFalse = () => (
  <div className="text-muted-foreground grid h-full place-items-center py-3">
    <X className="size-4 align-middle" aria-label="absent" />
  </div>
);

export function FeatureTable() {
  return (
    <table className="w-full table-fixed border-collapse">
      <thead>
        <tr className="text-muted-foreground text-center text-sm font-semibold [&>th]:w-[22.222%] [&>th]:border-b [&>th]:p-4 [&>th]:pt-6 [&>th]:align-middle [&>th:first-child]:w-[33.333%] [&>th:first-child]:text-left">
          <th scope="col" className="sr-only">
            Feature
          </th>
          <th
            className="before:bg-card before:border-border relative isolate border-b-0 before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-t-2xl before:border-x before:border-t before:content-['']"
            scope="col">
            Turistar
          </th>
          <th scope="col">Spreadsheet</th>
          <th scope="col">No Planning</th>
        </tr>
      </thead>

      <tbody>
        {GROUPS.map((g, gi) => (
          <React.Fragment key={g.title}>
            <tr className="[&>td]:border-b [&>td]:p-0 [&>td]:align-middle [&>th]:border-b">
              <th scope="rowgroup" className="py-3 text-left font-semibold tracking-wide">
                {g.title}
              </th>
              <td
                className="before:bg-card before:border-border relative border-b-0 before:pointer-events-none before:absolute before:inset-x-0 before:inset-y-0 before:-mt-px before:border-x before:content-['']"
                aria-hidden="true"
              />
              <td />
              <td />
            </tr>

            {g.items.map((item, ii) => {
              return (
                <tr
                  key={item.id}
                  className="[&>td]:border-b [&>td]:p-0 [&>td]:align-middle [&>td:nth-child(2)]:border-b-0">
                  <td className="py-3 text-left text-sm">{item.label}</td>
                  <td className="relative">
                    <MarkTrue last={gi === GROUPS.length - 1 && ii === g.items.length - 1} />
                  </td>
                  <td>
                    <MarkFalse />
                  </td>
                  <td>
                    <MarkFalse />
                  </td>
                </tr>
              );
            })}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
}
