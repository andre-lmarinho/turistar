import type { ShareMember, ShareTier } from "../types";
import { SHARE_TIER_OPTIONS } from "../types";

export type MemberMenuOption = ShareTier | "leave" | "remove";

export function isTier(value: MemberMenuOption): value is ShareTier {
  return value === "admin" || value === "member";
}

export type MemberRowPolicyInput = {
  member: ShareMember;
  ownerId: string | null;
  adminCount: number;
  viewerUserId: string | null;
  canManageMembers: boolean;
};

export type MemberRowPolicy = {
  isOwner: boolean;
  isSelf: boolean;
  isLastAdmin: boolean;
  canManageMember: boolean;
  canRemove: boolean;
  canSelfLeave: boolean;
  canSelect: boolean;
  tierOptions: readonly { value: ShareTier; label: (typeof SHARE_TIER_OPTIONS)[number]["label"] }[];
};

/**
 * Role rules for one member row: who may change tiers, who may be removed,
 * and when the last admin or the owner may leave.
 */
export function resolveMemberRowPolicy({
  member,
  ownerId,
  adminCount,
  viewerUserId,
  canManageMembers,
}: MemberRowPolicyInput): MemberRowPolicy {
  const isOwner = ownerId === member.userId;
  const isSelf = viewerUserId === member.userId;
  const isAdmin = member.tier === "admin";
  const isLastAdmin = isAdmin && adminCount <= 1;
  const isAdminOrOwner = isAdmin || isOwner;
  const canManageMember = canManageMembers && !isOwner;
  const canRemove = canManageMember && !isSelf;
  const canSelfLeave = isSelf && (!isAdminOrOwner || adminCount > 1);
  const canSelect = isOwner ? canSelfLeave : canManageMembers || isSelf;

  let tierOptions: readonly { value: ShareTier; label: (typeof SHARE_TIER_OPTIONS)[number]["label"] }[];
  if (!canManageMembers && isSelf) {
    tierOptions = SHARE_TIER_OPTIONS.filter((tierOption) => tierOption.value === member.tier);
  } else if (isOwner || isLastAdmin) {
    tierOptions = SHARE_TIER_OPTIONS.filter((tierOption) => tierOption.value === "admin");
  } else {
    tierOptions = SHARE_TIER_OPTIONS;
  }

  return { isOwner, isSelf, isLastAdmin, canManageMember, canRemove, canSelfLeave, canSelect, tierOptions };
}
