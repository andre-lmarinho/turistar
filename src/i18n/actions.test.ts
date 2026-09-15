import { beforeEach, expect, it, vi } from "vitest";
import { setLocale } from "./actions";

const { set } = vi.hoisted(() => ({ set: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => ({ set }) }));
beforeEach(() => set.mockClear());
it("rejects unsupported cookies before writing", async () => {
  await expect(setLocale("../../invalid")).rejects.toThrow("unsupported locale");
  expect(set).not.toHaveBeenCalled();
});
it("writes only a browser preference without authentication", async () => {
  await setLocale("pt-BR");
  expect(set).toHaveBeenCalledWith(
    "turistar_locale",
    "pt-BR",
    expect.objectContaining({
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 31536000,
    })
  );
});
