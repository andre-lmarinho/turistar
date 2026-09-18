import { NextResponse } from "next/server";
import { validateGeoapifyQuery } from "./validateQuery";

describe("validateGeoapifyQuery", () => {
  it("returns an error response when the parameter is missing", async () => {
    const result = validateGeoapifyQuery(new URLSearchParams(), "text");

    expect(result).toBeInstanceOf(NextResponse);
    const response = result as NextResponse;
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Query is required." });
  });

  it("returns an error response when the value is shorter than the minimum", async () => {
    const shortValue = "aa";
    const params = new URLSearchParams({ text: shortValue });
    const result = validateGeoapifyQuery(params, "text");

    expect(result).toBeInstanceOf(NextResponse);
    const response = result as NextResponse;
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Query must be at least 3 characters.",
    });
  });

  it("returns the string when the parameter is valid", () => {
    const validValue = "aaa";
    const params = new URLSearchParams({ text: validValue });

    const result = validateGeoapifyQuery(params, "text");

    expect(result).toBe(validValue);
  });
});
