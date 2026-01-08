import type { ReactNode } from "react";

import { ClientProviders } from "@/app/providers";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <ClientProviders>
      <main className="py-12 bg-card flex min-h-screen flex-col items-stretch justify-center">
        {children}
      </main>
    </ClientProviders>
  );
}
