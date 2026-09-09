import { readFileSync } from "node:fs";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DestinationsMap } from "@/modules/user/components/DestinationsMap";

const boundaries = JSON.parse(readFileSync("public/data/countries.geojson", "utf8"));
const countries = [
  { code: " BR ", tripCount: 1, locationCount: 3, trips: [{ id: "trip-1", title: "Brazil adventure" }] },
];

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => boundaries }));
});
afterEach(() => vi.unstubAllGlobals());

describe("travel map", () => {
  it("highlights visited countries and shows the name of unvisited countries on hover", async () => {
    render(<DestinationsMap countries={countries} />);
    const brazil = await screen.findByLabelText("Brazil — Visited");
    expect(brazil).toHaveClass("fill-primary");
    fireEvent.mouseOver(brazil);
    expect(screen.getByText("Brazil adventure")).toBeVisible();
    expect(screen.getByText("1 trip · 3 locations")).toBeVisible();
    fireEvent.mouseOut(brazil);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(brazil).toHaveClass("fill-primary");
    const france = screen.getByLabelText("France — Not visited yet");
    fireEvent.mouseOver(france);
    expect(within(screen.getByRole("tooltip")).getByText("France")).toBeVisible();
    expect(screen.queryByText("Brazil adventure")).not.toBeInTheDocument();
    fireEvent.mouseOut(france);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      "/data/countries.geojson",
      expect.objectContaining({ cache: "force-cache" })
    );
  });

  it("supports keyboard selection, dismissal and touch without a dropdown", async () => {
    render(<DestinationsMap countries={countries} />);
    const brazil = await screen.findByLabelText("Brazil — Visited");
    fireEvent.focus(brazil);
    expect(screen.getByText("Brazil adventure")).toBeVisible();
    fireEvent.keyDown(brazil, { key: "Escape" });
    expect(screen.queryByText("Brazil adventure")).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    fireEvent.click(brazil);
    expect(within(screen.getByRole("tooltip")).getByText("Brazil adventure")).toBeVisible();
  });

  it("keeps the world explorable without any visited countries", async () => {
    render(<DestinationsMap countries={[]} />);
    expect(await screen.findByLabelText("Brazil — Not visited yet")).toBeVisible();
    expect(screen.queryByText(/Add destinations|Hover over a country/)).not.toBeInTheDocument();
    fireEvent.mouseOver(screen.getByLabelText("Brazil — Not visited yet"));
    expect(within(screen.getByRole("tooltip")).getByText("Not visited yet")).toBeVisible();
  });

  it("offers a working retry when the local boundaries cannot load", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: false } as Response);
    render(<DestinationsMap countries={[]} />);
    fireEvent.click(await screen.findByRole("button", { name: "Try again" }));
    expect(await screen.findByLabelText("Brazil — Not visited yet")).toBeVisible();
    expect(fetch).toHaveBeenCalledTimes(2);
    const initialRequest = vi.mocked(fetch).mock.calls[0][1];
    expect(initialRequest?.signal?.aborted).toBe(true);
  });
  it("aborts a pending request when the map unmounts", () => {
    vi.mocked(fetch).mockReturnValue(new Promise(() => {}));
    const { unmount } = render(<DestinationsMap countries={[]} />);
    const request = vi.mocked(fetch).mock.calls[0][1];
    expect(request?.signal?.aborted).toBe(false);
    unmount();
    expect(request?.signal?.aborted).toBe(true);
  });
});
