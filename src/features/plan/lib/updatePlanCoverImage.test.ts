import type { SupabaseClient } from "@supabase/supabase-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";

import { updatePlanCoverImage } from "./updatePlanCoverImage";

vi.mock("@/shared/lib/supabaseServer", () => ({
  createSupabaseServerClient: vi.fn(),
}));

describe("updatePlanCoverImage", () => {
  beforeEach(() => {
    vi.mocked(createSupabaseServerClient).mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("successfully updates the cover image for a plan", async () => {
    const mockUpdate = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockResolvedValue({ error: null });

    vi.mocked(createSupabaseServerClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        update: mockUpdate,
      }),
    } as unknown as ReturnType<typeof createSupabaseServerClient>);

    mockUpdate.mockReturnValue({
      eq: mockEq,
    });

    await updatePlanCoverImage("plan-123", "https://example.com/image.jpg");

    expect(mockUpdate).toHaveBeenCalledWith({ cover_image: "https://example.com/image.jpg" });
    expect(mockEq).toHaveBeenCalledWith("id", "plan-123");
    expect(console.error).not.toHaveBeenCalled();
  });

  it("logs error when Supabase update fails", async () => {
    const mockError = { message: "Database error", code: "42P01" };
    const mockUpdate = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockResolvedValue({ error: mockError });

    vi.mocked(createSupabaseServerClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        update: mockUpdate,
      }),
    } as unknown as ReturnType<typeof createSupabaseServerClient>);

    mockUpdate.mockReturnValue({
      eq: mockEq,
    });

    await updatePlanCoverImage("plan-456", "https://example.com/image2.jpg");

    expect(console.error).toHaveBeenCalledWith(
      "Failed to update plan cover image: planId=plan-456",
      mockError
    );
  });

  it("logs error when update throws an exception", async () => {
    const mockError = new Error("Network failure");
    const mockUpdate = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockRejectedValue(mockError);

    vi.mocked(createSupabaseServerClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        update: mockUpdate,
      }),
    } as unknown as ReturnType<typeof createSupabaseServerClient>);

    mockUpdate.mockReturnValue({
      eq: mockEq,
    });

    await updatePlanCoverImage("plan-789", "https://example.com/image3.jpg");

    expect(console.error).toHaveBeenCalledWith(
      "Unexpected error updating plan cover image: planId=plan-789",
      mockError
    );
  });

  it("uses custom Supabase client when provided", async () => {
    const mockUpdate = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const customClient = {
      from: vi.fn().mockReturnValue({
        update: mockUpdate,
      }),
    } as unknown as SupabaseClient;

    mockUpdate.mockReturnValue({
      eq: mockEq,
    });

    await updatePlanCoverImage("plan-custom", "https://example.com/custom.jpg", customClient);

    expect(customClient.from).toHaveBeenCalledWith("plans");
    expect(createSupabaseServerClient).not.toHaveBeenCalled();
  });

  it("does not throw errors to avoid breaking async updates", async () => {
    const mockUpdate = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockRejectedValue(new Error("Fatal error"));

    vi.mocked(createSupabaseServerClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        update: mockUpdate,
      }),
    } as unknown as ReturnType<typeof createSupabaseServerClient>);

    mockUpdate.mockReturnValue({
      eq: mockEq,
    });

    // Should not throw
    await expect(updatePlanCoverImage("plan-999", "https://example.com/fail.jpg")).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });
});
