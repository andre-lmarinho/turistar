import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import type { DayPlan } from "@/features/activity/types";
import { MapView } from "./MapView";

vi.unmock("react-leaflet");
vi.unmock("leaflet");

it("updates an existing activity marker label after renaming, using real Leaflet markers", async () => {
  const activity = {
    id: "activity-1",
    title: "Museum",
    color: "bg-[var(--color-1)]",
    latitude: 1,
    longitude: 2,
  };
  const days: DayPlan[] = [{ id: "day-1", label: "Day 1", activities: [activity] }];
  const select = vi.fn();
  const { rerender } = render(<MapView days={days} destCoords={null} onActivitySelect={select} />);
  await waitFor(() => expect(screen.getByTitle("Museum")).toHaveClass("leaflet-marker-icon"));

  const renamed = { ...activity, title: "City Museum" };
  rerender(
    <MapView days={[{ ...days[0], activities: [renamed] }]} destCoords={null} onActivitySelect={select} />
  );
  const marker = await screen.findByTitle("City Museum");
  expect(screen.queryByTitle("Museum")).not.toBeInTheDocument();
  fireEvent.click(marker);
  expect(select).toHaveBeenCalledExactlyOnceWith(renamed, "day-1");
});
