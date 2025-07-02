// src/app/planner/catalog/page.tsx
import { Suspense } from "react";
import CatalogClient from "./CatalogClient";

export const dynamic = "force-dynamic";

export default function CatalogPage() {
  return (
    <Suspense fallback={<p className="p-4">Loading search...</p>}>
      <CatalogClient />
    </Suspense>
  );
}
