import type { ReactNode } from "react";

import { AuthBar } from "@/modules/auth/layout/AuthBar";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-folio-paper p-[clamp(1rem,2.6vw,2.25rem)_clamp(1rem,4vw,4rem)] text-folio-ink accent-folio-ink caret-folio-coral selection:bg-folio-citron selection:text-folio-ink [&_button:focus-visible]:outline-[3px] [&_button:focus-visible]:outline-folio-coral [&_button:focus-visible]:outline-offset-[3px] [&_a:focus-visible]:outline-[3px] [&_a:focus-visible]:outline-folio-coral [&_a:focus-visible]:outline-offset-[3px] max-folio-phone:px-4 max-folio-phone:py-3 max-folio-short:min-[34.01rem]:py-3">
      <AuthBar />
      {children}
    </div>
  );
}
