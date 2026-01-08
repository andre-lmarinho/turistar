import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

const { mockIsUsernameAvailable } = vi.hoisted(() => ({
  mockIsUsernameAvailable: vi.fn(),
}));

vi.mock("@/features/auth/lib/isUsernameAvailable", () => ({
  isUsernameAvailable: mockIsUsernameAvailable,
}));

const createRequest = (username?: string): NextRequest => {
  const search = username ? `?username=${encodeURIComponent(username)}` : "";
  return {
    url: `https://example.com/api/profile/availability${search}`,
  } as NextRequest;
};

describe("GET /api/profile/availability", () => {
  beforeEach(() => {
    mockIsUsernameAvailable.mockReset();
  });

  it("returns 400 when username is missing", async () => {
    const res = await GET(createRequest());

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: "Username is required." });
  });

  it("returns 400 when username is invalid", async () => {
    const res = await GET(createRequest("-bad"));

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      error: "Username contains invalid characters or format.",
    });
  });

  it("returns availability when username is free", async () => {
    mockIsUsernameAvailable.mockResolvedValue(true);

    const res = await GET(createRequest("alice"));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ available: true });
  });

  it("returns availability when username is taken", async () => {
    mockIsUsernameAvailable.mockResolvedValue(false);

    const res = await GET(createRequest("alice"));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ available: false });
  });

  it("returns 500 when availability lookup fails", async () => {
    mockIsUsernameAvailable.mockRejectedValue(new Error("network failed"));

    const res = await GET(createRequest("alice"));

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({
      error: "Unable to check username availability.",
    });
  });
});
