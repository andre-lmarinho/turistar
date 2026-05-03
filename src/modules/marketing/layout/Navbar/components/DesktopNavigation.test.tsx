import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DesktopNavigation } from "./DesktopNavigation";

describe("DesktopNavigation", () => {
  it("opens and closes the explore dropdown", () => {
    render(<DesktopNavigation />);

    const trigger = screen.getByRole("button", { name: "Explore" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: "Adventure" })).toBeNull();

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Adventure" })).toHaveAttribute("href", "/planning/adventure");

    fireEvent.keyDown(document, { key: "Escape" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: "Adventure" })).toBeNull();
  });

  it("closes the explore dropdown after selecting a link", () => {
    render(<DesktopNavigation />);

    const trigger = screen.getByRole("button", { name: "Explore" });

    fireEvent.click(trigger);
    const adventureLink = screen.getByRole("link", { name: "Adventure" });
    adventureLink.addEventListener("click", (event) => event.preventDefault());

    fireEvent.click(adventureLink);

    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("renders direct navigation links", () => {
    render(<DesktopNavigation />);

    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Friends" })).toHaveAttribute("href", "/friends");
  });
});
