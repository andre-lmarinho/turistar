import { describe, expect, it } from "vitest";

import { mapResetPasswordError } from "./mapResetPasswordError";

describe("mapResetPasswordError", () => {
  it("maps missing messages and PKCE failures to the invalid-link message", () => {
    for (const error of [null, "   ", new Error("PKCE code verifier not found in storage")]) {
      expect(mapResetPasswordError(error)).toBe("Reset link is invalid or has expired.");
    }
  });

  it("preserves other error messages", () => {
    expect(mapResetPasswordError(new Error("Try again later."))).toBe("Try again later.");
  });
});
