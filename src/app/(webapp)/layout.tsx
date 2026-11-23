import type { ReactNode } from "react";

import { AppBar } from "@/modules/layout/AppBar";

export default function WebAppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh md:pl-20">
      <AppBar />
      {children}
    </div>
  );
}
