import { createMockSupabaseClient } from "@tests/utils/mocks";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTRPCInnerContext } from "../../../createContext";
import { createCallerFactory } from "../../../trpc";
import { appRouter } from "../../_app";

const { checkAvailabilityMock } = vi.hoisted(() => ({
  checkAvailabilityMock: vi.fn(),
}));

vi.mock("@/supabase/serviceRole", () => ({ createSupabaseServiceRoleClient: () => ({}) }));
vi.mock("@/features/profile/repositories/ProfileRepository", () => ({
  ProfileRepository: class {},
}));
vi.mock("@/features/profile/services/ProfileService", () => ({
  ProfileService: class {
    isUsernameAvailable = checkAvailabilityMock;
  },
}));

function createCaller() {
  return createCallerFactory(appRouter)(
    createTRPCInnerContext({
      viewer: null,
      requestMeta: { ip: null, requestId: "public-profile-test", userAgent: null },
      supabase: createMockSupabaseClient(),
    })
  );
}

describe("public profile router", () => {
  beforeEach(() => {
    checkAvailabilityMock.mockReset();
  });
  it("returns username availability", async () => {
    checkAvailabilityMock.mockResolvedValue(true);

    await expect(createCaller().public.profile.availability({ username: "alice" })).resolves.toEqual({
      available: true,
    });
  });

  it("rejects an empty username before reaching the service", async () => {
    await expect(createCaller().public.profile.availability({ username: " " })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
    expect(checkAvailabilityMock).not.toHaveBeenCalled();
  });
});
