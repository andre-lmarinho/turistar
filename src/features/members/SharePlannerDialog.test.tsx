import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SharePlannerDialog } from "./SharePlannerDialog";

vi.mock("@/features/shareLink/components/LinkSection", () => ({
  LinkSection: () => <div>Share link controls</div>,
}));

vi.mock("./components/InviteForm", () => ({
  InviteForm: () => <div>Invite form</div>,
}));

vi.mock("./components/MembersSection", () => ({
  MembersSection: () => <div>Members list</div>,
}));

describe("SharePlannerDialog", () => {
  it("provides an accessible description", () => {
    render(<SharePlannerDialog planId="plan-1" />);

    fireEvent.click(screen.getByRole("button", { name: "Share planner" }));

    expect(screen.getByRole("dialog", { name: "Share planner" })).toHaveAccessibleDescription(
      "Invite people, manage planner members, and create or revoke a share link."
    );
  });
});
