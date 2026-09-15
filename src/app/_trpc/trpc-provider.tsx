"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useState } from "react";

import { trpc } from "@/trpc/react";

import { createQueryClient } from "./query-client";
import { createTRPCClient } from "./trpc-client";

type TRPCProviderProps = {
  children: ReactNode;
};

export function TRPCProvider({ children }: TRPCProviderProps) {
  const t = useTranslations();
  const [queryClient] = useState(() => createQueryClient(t("unexpectedError")));
  const [trpcClient] = useState(createTRPCClient);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
