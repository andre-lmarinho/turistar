import "server-only";

import { notFound } from "next/navigation";

import { INSPIRATION_SLUGS } from "@/features/inspirations/data";
import type { InspirationDocument } from "@/features/inspirations/lib/schemas";
import { inspirationDocumentSchema } from "@/features/inspirations/lib/schemas";

const loaders: Record<string, () => Promise<{ default: unknown }>> = {
  rome: () => import("../destinations/rome.json"),
  paris: () => import("../destinations/paris.json"),
  boipeba: () => import("../destinations/boipeba.json"),
};

if (process.env.NODE_ENV === "development") {
  const loaderKeys = Object.keys(loaders).sort();
  const manifestKeys = [...INSPIRATION_SLUGS].sort();
  if (JSON.stringify(loaderKeys) !== JSON.stringify(manifestKeys)) {
    throw new Error(
      "Loader map and INSPIRATION_SLUGS are out of sync.\n" +
        "Loaders: " +
        loaderKeys.join(", ") +
        "\n" +
        "Manifest: " +
        manifestKeys.join(", ")
    );
  }
}

export async function loadInspirationBySlug(slug: string): Promise<InspirationDocument> {
  const loader = loaders[slug];
  if (!loader) notFound();

  const module = await loader();
  return inspirationDocumentSchema.parse(module.default);
}
