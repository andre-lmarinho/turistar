// src/app/planner/ConfigSidebar.tsx
"use client";

import React from "react";

/**
 * Collapsible sidebar that only consumes width when open.
 * - `open === true` → width 16rem (Tailwind w-64)
 * - `open === false` → width 0; cards fill entire row
 * Smooth width animation via `transition-[width]`.
 */
export default function ConfigSidebar({
  open,
  children,
}: {
  open: boolean;
  children?: React.ReactNode;
}) {
  return (
    <aside
      className={`
        overflow-hidden border-r bg-gray-50
        transition-[width] duration-300
        ${open ? "w-64 p-4" : "w-0 p-0"}
      `}
    >
      {/* Render content only when open to avoid focus/tab stops */}
      {open && (children ?? <p className="text-sm text-gray-500">Config area (coming soon)</p>)}
    </aside>
  );
}
