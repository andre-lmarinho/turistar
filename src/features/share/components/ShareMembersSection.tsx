"use client";

import { useState } from "react";

import { usePlannerContext } from "@/features/app/planner/hooks/PlannerContext";
import { SHARE_TIERS } from "@/features/share/constants";
import { useLeavePlannerRedirect } from "@/features/share/hook/useLeavePlannerRedirect";
import {
  type PlanMemberProfile,
  type PlanMemberTier,
  usePlanMembers,
} from "@/features/share/hook/usePlanSharing";
import { Avatar } from "@/shared/ui/avatar";
import type { SelectMenuOption } from "@/shared/ui/select/SelectMenu";
import { SelectMenu } from "@/shared/ui/select/SelectMenu";

type MemberMenuOption = PlanMemberTier | "leave" | "remove";

type MemberMutations = Pick<ReturnType<typeof usePlanMembers>, "updateTier" | "removeMember" | "leave">;

type ShareMemberRowProps = {
  member: PlanMemberProfile;
  ownerId: string | null;
  adminCount: number;
  viewerUserId: string | null;
  canManageMembers: boolean;
  mutations: MemberMutations;
  onLeave: (member: PlanMemberProfile) => void;
};

function ShareMemberRow({
  member,
  ownerId,
  adminCount,
  viewerUserId,
  canManageMembers,
  mutations,
  onLeave,
}: ShareMemberRowProps) {
  const isPlanOwner = ownerId === member.userId;
  const isSelf = viewerUserId === member.userId;
  const isSelfAdmin = isSelf && member.tier === "admin";
  const isLastAdmin = member.tier === "admin" && adminCount <= 1;
  const canRemove = canManageMembers && !isPlanOwner && !isSelf;
  const canSelfLeave = isSelf && (!isSelfAdmin || adminCount > 1) && (!isPlanOwner || adminCount > 1);
  const canSelect = (!isPlanOwner && (canManageMembers || isSelf)) || (isPlanOwner && canSelfLeave);
  const tierOptions: ReadonlyArray<SelectMenuOption<MemberMenuOption>> =
    isPlanOwner || isLastAdmin
      ? SHARE_TIERS.filter((tierOption) => tierOption.value === "admin")
      : SHARE_TIERS;
  const leaveOption: SelectMenuOption<MemberMenuOption> | null = canSelfLeave
    ? { value: "leave", label: "Leave planner" }
    : null;
  const removeOption: SelectMenuOption<MemberMenuOption> | null = canRemove
    ? { value: "remove", label: "Remove member" }
    : null;
  const menuOptions: SelectMenuOption<MemberMenuOption>[] = [
    ...tierOptions,
    ...(leaveOption ? [leaveOption] : []),
    ...(removeOption ? [removeOption] : []),
  ];
  const displayName = member.displayName ?? (isPlanOwner ? "Owner" : "User");

  return (
    <div className="bg-background flex items-center justify-between gap-3 rounded-md py-2">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar size="lg" displayName={displayName} />
        <div className="min-w-0">
          <p className="text-foreground truncate text-sm font-medium">
            {displayName}
            {isPlanOwner ? " (owner)" : ""}
          </p>
          {member.slug ? <p className="text-muted-foreground truncate text-xs">@{member.slug}</p> : null}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <SelectMenu<MemberMenuOption>
          value={member.tier}
          options={menuOptions}
          onChange={(nextValue) => {
            if (nextValue === "leave" && canSelfLeave) {
              onLeave(member);
              return;
            }
            if (nextValue === "remove" && canRemove) {
              mutations.removeMember.mutate({ userId: member.userId });
              return;
            }
            if (!canManageMembers) {
              return;
            }
            if (isPlanOwner) {
              return;
            }
            mutations.updateTier.mutate({
              userId: member.userId,
              tier: nextValue as PlanMemberTier,
            });
          }}
          disabled={
            !canSelect ||
            mutations.updateTier.isPending ||
            mutations.leave.isPending ||
            mutations.removeMember.isPending
          }
          ariaLabel={`${displayName} role`}
          triggerClassName="w-28 shrink-0"
          contentClassName="w-38"
          align="end"
        />
      </div>
    </div>
  );
}

export function ShareMembersSection({ planId }: { planId: string }) {
  const [tab, setTab] = useState<"members" | "requests">("members");
  const { data, isLoading, error, updateTier, removeMember, leave } = usePlanMembers(planId, {
    enabled: Boolean(planId),
  });
  const { viewerUserId, canManageMembers } = usePlannerContext();
  const { handleLeave } = useLeavePlannerRedirect({ viewerUserId, leave });

  const ownerId = data?.ownerId ?? null;
  const members = data?.members ?? [];
  const adminCount = members.filter((member) => member.tier === "admin").length;
  const shouldShowEmpty = !isLoading && !error && !members.length;
  const shouldShowList = !isLoading && !error && members.length > 0;

  return (
    <div className="space-y-3">
      <div className="border-border flex items-center gap-3 border-b pb-2 text-sm font-medium">
        <button
          type="button"
          onClick={() => setTab("members")}
          className={`transition-colors ${tab === "members" ? "text-primary" : "text-muted-foreground"}`}>
          Members
        </button>
        <button
          type="button"
          onClick={() => setTab("requests")}
          className={`transition-colors ${tab === "requests" ? "text-primary" : "text-muted-foreground"}`}>
          Requests
        </button>
      </div>
      {tab === "members" ? (
        <>
          {isLoading ? <p className="text-muted-foreground text-xs">Loading members...</p> : null}
          {error ? <p className="text-destructive text-xs">Unable to load members.</p> : null}
          {shouldShowEmpty ? <p className="text-muted-foreground text-xs">No members yet.</p> : null}
          {shouldShowList ? (
            <div className="space-y-2">
              {members.map((member) => (
                <ShareMemberRow
                  key={member.userId}
                  member={member}
                  ownerId={ownerId}
                  adminCount={adminCount}
                  viewerUserId={viewerUserId}
                  canManageMembers={canManageMembers}
                  mutations={{ updateTier, removeMember, leave }}
                  onLeave={handleLeave}
                />
              ))}
            </div>
          ) : null}
        </>
      ) : (
        <p className="text-muted-foreground text-xs">No requests yet.</p>
      )}
    </div>
  );
}
