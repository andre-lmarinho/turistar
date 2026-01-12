import { render, screen } from "@testing-library/react";

import { getMarketingInspirations } from "@/features/inspirations/data";
import { InspirationLink } from "@/features/website/sections/InspirationLink";

describe("InspirationLink", () => {
  it("renders featured destinations as links with correct hrefs", () => {
    render(<InspirationLink />);

    const featured = getMarketingInspirations();

    for (const item of featured) {
      expect(
        screen.getByRole("link", {
          name: new RegExp(item.title, "i"),
        })
      ).toHaveAttribute("href", `/p/inspiration/${item.slug}`);
    }

    expect(screen.getAllByRole("link")).toHaveLength(featured.length);
  });
});
