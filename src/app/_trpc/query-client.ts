import { MutationCache, QueryClient } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import { toast } from "@/ui/components/toast";

export function createQueryClient(unexpectedError: string) {
  return new QueryClient({
    mutationCache: new MutationCache({
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : unexpectedError);
      },
    }),
    defaultOptions: {
      mutations: { retry: false },
      queries: {
        refetchOnWindowFocus: false,
        retry(failureCount, error) {
          if (
            error instanceof TRPCClientError &&
            ["BAD_REQUEST", "FORBIDDEN", "UNAUTHORIZED"].includes(error.data?.code)
          ) {
            return false;
          }
          return failureCount < 3;
        },
        staleTime: 1000,
      },
    },
  });
}
