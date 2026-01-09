import { render, screen } from "@testing-library/react";
import boipeba from "@/features/inspirations/destinations/boipeba.json";
import rome from "@/features/inspirations/destinations/rome.json";
import type { InspirationDocument } from "@/features/inspirations/types";
import { InspirationLink } from "@/features/website/sections/InspirationLink";

describe("InspirationLink", () => {
  it("renders destinations as links with correct hrefs", () => {
    render(<InspirationLink />);

    const romeTitle = (rome as InspirationDocument).title_inspiration ?? "";
    const boipebaTitle = (boipeba as InspirationDocument).title_inspiration ?? "";

    expect(
      screen.getByRole("link", {
        name: new RegExp(romeTitle, "i"),
      })
    ).toHaveAttribute("href", "/p/inspiration/rome");

    expect(
      screen.getByRole("link", {
        name: new RegExp(boipebaTitle, "i"),
      })
    ).toHaveAttribute("href", "/p/inspiration/boipeba");

    expect(screen.getAllByRole("link")).toHaveLength(2);
  });
});
