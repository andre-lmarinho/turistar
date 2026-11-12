import { describe, expect, it } from "vitest";

import type { ShareMember } from "../types";
import { isTier, resolveMemberRowPolicy } from "./memberPolicy";

const member: ShareMember = {
  userId: "user-1",
  tier: "admin",
  slug: null,
  displayName: null,
  avatarUrl: null,
};

function policy(overrides: {
  member?: ShareMember;
  ownerId?: string | null;
  adminCount?: number;
  viewerUserId?: string | null;
  canManageMembers?: boolean;
}) {
  return resolveMemberRowPolicy({
    member: overrides.member ?? member,
    ownerId: overrides.ownerId ?? "owner-1",
    adminCount: overrides.adminCount ?? 1,
    viewerUserId: overrides.viewerUserId ?? null,
    canManageMembers: overrides.canManageMembers ?? true,
  });
}

describe("isTier", () => {
  it("separates tiers from the leave and remove actions", () => {
    expect(isTier("admin")).toBe(true);
    expect(isTier("member")).toBe(true);
    expect(isTier("leave")).toBe(false);
    expect(isTier("remove")).toBe(false);
  });
});

describe("resolveMemberRowPolicy", () => {
  it("protects the owner: nobody manages, removes, or retiers them", () => {
    const result = policy({ member: { ...member, userId: "owner-1" } });

    expect(result.isOwner).toBe(true);
    expect(result.canManageMember).toBe(false);
    expect(result.canRemove).toBe(false);
    expect(result.tierOptions.map((option) => option.value)).toEqual(["admin"]);
  });

  it("blocks the last admin from leaving or self-demoting", () => {
    const result = policy({ viewerUserId: "user-1", adminCount: 1 });

    expect(result.isSelf).toBe(true);
    expect(result.isLastAdmin).toBe(true);
    expect(result.canSelfLeave).toBe(false);
    expect(result.tierOptions.map((option) => option.value)).toEqual(["admin"]);
  });

  it("lets an admin leave when another admin remains", () => {
    const result = policy({ viewerUserId: "user-1", adminCount: 2 });

    expect(result.canSelfLeave).toBe(true);
  });

  it("lets a plain member leave but not remove themselves", () => {
    const result = policy({ member: { ...member, tier: "member" }, viewerUserId: "user-1", adminCount: 1 });

    expect(result.canSelfLeave).toBe(true);
    expect(result.canRemove).toBe(false);
  });

  it("lets admins manage other members but never the owner", () => {
    const result = policy({ member: { ...member, userId: "user-2" }, viewerUserId: "user-1", adminCount: 2 });

    expect(result.canManageMember).toBe(true);
    expect(result.canRemove).toBe(true);
    expect(result.tierOptions.map((option) => option.value)).toEqual(["admin", "member"]);
  });

  it("locks the tier select for members without management rights", () => {
    const result = policy({
      member: { ...member, userId: "user-2" },
      viewerUserId: "user-3",
      canManageMembers: false,
    });

    expect(result.canManageMember).toBe(false);
    expect(result.canRemove).toBe(false);
    expect(result.canSelect).toBe(false);
  });

  it("offers a plain member only their current tier when they cannot manage", () => {
    const result = policy({
      member: { ...member, userId: "user-1", tier: "member" },
      viewerUserId: "user-1",
      canManageMembers: false,
    });

    expect(result.canSelect).toBe(true);
    expect(result.tierOptions.map((option) => option.value)).toEqual(["member"]);
  });
});
