import type { ReactNode } from "react";

import { ClientProviders } from "@/app/providers";
import { AppBar } from "@/modules/planner/layout/AppBar";

export default function WebAppLayout({ children }: { children: ReactNode }) {
  return (
    <ClientProviders>
      <AppBar />
      {children}
    </ClientProviders>
  );
}
