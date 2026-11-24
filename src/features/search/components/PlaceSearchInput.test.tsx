import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, expect, it, vi } from "vitest";
import type { AutocompletePlace } from "../types";
import { PlaceSearchInput } from "./PlaceSearchInput";

afterEach(() => vi.unstubAllGlobals());

function Field({ select }: { select: (place: AutocompletePlace) => void }) {
  const [value, setValue] = useState("");
  return (
    <PlaceSearchInput
      aria-label="Destination"
      source="city-country"
      value={value}
      onChange={(next) => {
        if (typeof next !== "string") select(next);
        setValue(typeof next === "string" ? next : next.name);
      }}
    />
  );
}
it("searches the settled text and returns the original place, including its country", async () => {
  const place = { name: "Paris, France", latitude: 48.86, longitude: 2.35, countryCode: "fr", placeId: "p1" };
  const fetch = vi.fn().mockResolvedValue(Response.json({ results: [place] }));
  vi.stubGlobal("fetch", fetch);
  const select = vi.fn();
  render(<Field select={select} />);
  const field = screen.getByRole("combobox");
  fireEvent.input(field, { target: { value: "Pa" }, inputType: "insertText" });
  expect(field).toHaveAttribute("aria-expanded", "false");
  fireEvent.input(field, { target: { value: "Par" }, inputType: "insertText" });
  fireEvent.input(field, { target: { value: "Paris" }, inputType: "insertText" });
  fireEvent.click(await screen.findByRole("option", { name: place.name }));
  expect(fetch).toHaveBeenCalledExactlyOnceWith("/api/places/city-country?text=Paris", {
    signal: expect.any(AbortSignal),
  });
  expect(select).toHaveBeenCalledExactlyOnceWith(place);
  expect(field).toHaveValue(place.name);
  expect(field).toHaveAttribute("aria-expanded", "false");
});
