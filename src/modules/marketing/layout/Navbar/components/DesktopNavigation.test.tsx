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

  it("opens on hover and closes when leaving the explore item", () => {
    render(<DesktopNavigation />);

    const trigger = screen.getByRole("button", { name: "Explore" });
    const exploreItem = trigger.closest("li");

    if (!exploreItem) {
      throw new Error("Unable to find explore navigation item");
    }

    fireEvent.mouseEnter(exploreItem);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Adventure" })).toBeInTheDocument();

    fireEvent.mouseLeave(exploreItem);

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: "Adventure" })).toBeNull();
  });

  it("keeps the dropdown open for internal pointer interactions", () => {
    render(<DesktopNavigation />);

    const trigger = screen.getByRole("button", { name: "Explore" });

    fireEvent.click(trigger);
    fireEvent.pointerDown(screen.getByRole("link", { name: "Adventure" }));

    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("closes the dropdown for outside pointer interactions", () => {
    render(
      <>
        <DesktopNavigation />
        <button type="button">Outside target</button>
      </>
    );

    const trigger = screen.getByRole("button", { name: "Explore" });

    fireEvent.click(trigger);
    fireEvent.pointerDown(screen.getByRole("button", { name: "Outside target" }));

    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("ignores non-escape document keydown events", () => {
    render(<DesktopNavigation />);

    const trigger = screen.getByRole("button", { name: "Explore" });

    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: "Enter" });

    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("closes when focus leaves the navigation", () => {
    render(
      <>
        <DesktopNavigation />
        <button type="button">After navigation</button>
      </>
    );

    const navigation = screen.getByRole("navigation");
    const trigger = screen.getByRole("button", { name: "Explore" });
    const outsideTarget = screen.getByRole("button", { name: "After navigation" });

    fireEvent.click(trigger);
    fireEvent.blur(navigation, { relatedTarget: outsideTarget });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("keeps the dropdown open when focus stays inside the navigation", () => {
    render(<DesktopNavigation />);

    const navigation = screen.getByRole("navigation");
    const trigger = screen.getByRole("button", { name: "Explore" });
    const friendsLink = screen.getByRole("link", { name: "Friends" });

    fireEvent.click(trigger);
    fireEvent.blur(navigation, { relatedTarget: friendsLink });

    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("renders direct navigation links", () => {
    render(<DesktopNavigation />);

    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Friends" })).toHaveAttribute("href", "/friends");
  });
});
