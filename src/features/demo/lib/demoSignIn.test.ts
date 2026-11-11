import { beforeEach, describe, expect, it, vi } from "vitest";

import { signInWithPassword } from "@/features/auth/handlers/signInWithPassword";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/features/demo/lib/demo";

import { demoSignIn } from "./demoSignIn";

vi.mock("@/features/auth/handlers/signInWithPassword", () => ({
  signInWithPassword: vi.fn(),
}));

const mockedSignIn = vi.mocked(signInWithPassword);

beforeEach(() => {
  mockedSignIn.mockReset();
});

describe("demoSignIn", () => {
  it("signs in with the shared demo credentials and returns the slug", async () => {
    mockedSignIn.mockResolvedValue({ slug: "some-other-slug" });

    const slug = await demoSignIn(async () => "some-other-slug");

    expect(mockedSignIn).toHaveBeenCalledWith({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      resolveProfile: expect.any(Function),
    });
    expect(slug).toBe("some-other-slug");
  });

  it("passes the provided resolveProfile through", async () => {
    const resolveProfile = vi.fn().mockResolvedValue("some-other-slug");
    mockedSignIn.mockResolvedValue({ slug: "some-other-slug" });

    const slug = await demoSignIn(resolveProfile);

    expect(mockedSignIn).toHaveBeenCalledWith({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      resolveProfile,
    });
    expect(slug).toBe("some-other-slug");
  });
});
