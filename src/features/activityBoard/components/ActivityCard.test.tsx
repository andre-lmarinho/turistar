import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EMPTY_ACTIVITY_TITLE } from "@/features/activity/constants";
import type { Activity } from "@/features/activity/types";

import { ActivityCard } from "./ActivityCard";

const baseActivity: Activity = {
  id: "a1",
  title: "Visit museum",
  color: "bg-[var(--color-1)]",
};

describe("ActivityCard", () => {
  it("renders the title and image when provided", () => {
    render(<ActivityCard activity={{ ...baseActivity, imageUrl: "/image.jpg" }} />);

    expect(screen.getByText("Visit museum")).toBeInTheDocument();
    expect(screen.getByAltText("")).toHaveAttribute("src", "/image.jpg");
  });

  it("falls back to the empty title when blank", () => {
    render(<ActivityCard activity={{ ...baseActivity, title: "  " }} />);

    expect(screen.getByText(EMPTY_ACTIVITY_TITLE)).toBeInTheDocument();
  });

  it("calls onSelect and onClick when clicked", () => {
    const handleSelect = vi.fn();
    const handleClick = vi.fn();

    render(<ActivityCard activity={baseActivity} onSelect={handleSelect} onClick={handleClick} />);

    fireEvent.click(screen.getByRole("button"));

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
