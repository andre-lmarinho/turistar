import type { ReactNode } from "react";

import { ClientProviders } from "@/app/providers";
import { AppBar } from "@/modules/planner/layout/AppBar";

/**
 * Layout component that wraps page content with client providers and renders an application bar above the children.
 *
 * @param children - Content to be rendered below the AppBar inside the client providers
 * @returns The composed layout element containing `ClientProviders`, an `AppBar`, and the provided `children`
 */
export default function WebAppLayout({ children }: { children: ReactNode }) {
  return (
    <ClientProviders>
      <AppBar />
      {children}
    </ClientProviders>
  );
}