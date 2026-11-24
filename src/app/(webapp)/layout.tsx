import type { ReactNode } from "react";

import { AppBar } from "@/modules/layout/AppBar";

export default function WebAppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col md:pl-20">
      <AppBar />
      {children}
    </div>
  );
}
