import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ShareLink } from "../types";
import { useShareLink } from "./useShareLink";

const shareLinkServiceMocks = vi.hoisted(() => ({
  getShareLink: vi.fn(),
  createShareLink: vi.fn(),
  revokeShareLink: vi.fn(),
}));

vi.mock("@/features/shareLink/services/ShareLinkService", () => ({
  __esModule: true,
  getShareLink: shareLinkServiceMocks.getShareLink,
  createShareLink: shareLinkServiceMocks.createShareLink,
  revokeShareLink: shareLinkServiceMocks.revokeShareLink,
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { wrapper, queryClient };
};

const linkKey = (planId: string) => ["share", "link", planId];

describe("useShareLink", () => {
  beforeEach(() => {
    shareLinkServiceMocks.getShareLink.mockReset();
    shareLinkServiceMocks.createShareLink.mockReset();
    shareLinkServiceMocks.revokeShareLink.mockReset();
  });

  it("restores the link when revocation fails", async () => {
    const { wrapper, queryClient } = createWrapper();
    const planId = "plan-1";
    const initialLink: ShareLink = {
      token: "token-1",
      createdAt: "2024-01-01T00:00:00.000Z",
      createdBy: "user-1",
      revokedAt: null,
    };
    queryClient.setQueryData(linkKey(planId), initialLink);
    shareLinkServiceMocks.revokeShareLink.mockRejectedValue(new Error("revoke failed"));

    const { result } = renderHook(() => useShareLink(planId, { enabled: false }), { wrapper });

    await act(async () => {
      await expect(result.current.revokeLink.mutateAsync()).rejects.toThrow("revoke failed");
    });

    await waitFor(() => {
      const updated = queryClient.getQueryData<ShareLink | null>(linkKey(planId));
      expect(updated).toEqual(initialLink);
    });
  });
});
