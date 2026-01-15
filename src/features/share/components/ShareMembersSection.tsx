"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

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

type ShareTab = "members" | "requests";

const SHARE_TABS: { value: ShareTab; label: string }[] = [
  { value: "members", label: "Members" },
  { value: "requests", label: "Requests" },
];

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
    !canManageMembers && isSelf
      ? SHARE_TIERS.filter((tierOption) => tierOption.value === member.tier)
      : isPlanOwner || isLastAdmin
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
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const tabParam = searchParams.get("tab");
  const tab: ShareTab = tabParam === "requests" ? "requests" : "members";

  const setTab = useCallback(
    (newTab: ShareTab) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newTab === "members") {
        params.delete("tab");
      } else {
        params.set("tab", newTab);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  const { data, isLoading, error, updateTier, removeMember, leave } = usePlanMembers(planId, {
    enabled: Boolean(planId),
  });
  const { viewerUserId, canManageMembers } = usePlannerContext();
  const { handleLeave, isLeaving } = useLeavePlannerRedirect({ viewerUserId, leave });

  const ownerId = data?.ownerId ?? null;
  const members = data?.members ?? [];
  const adminCount = members.filter((member) => member.tier === "admin").length;
  const shouldShowEmpty = !isLoading && !error && !members.length;
  const shouldShowList = !isLoading && !error && members.length > 0;

  return (
    <div className="space-y-3">
      <div
        role="tablist"
        aria-label="Share sections"
        className="border-border flex items-center gap-3 border-b pb-2 text-sm font-medium">
        {SHARE_TABS.map((tabItem) => (
          <button
            key={tabItem.value}
            type="button"
            role="tab"
            id={`share-tab-${tabItem.value}`}
            aria-selected={tab === tabItem.value}
            aria-controls={`share-panel-${tabItem.value}`}
            tabIndex={tab === tabItem.value ? 0 : -1}
            onClick={() => setTab(tabItem.value)}
            onKeyDown={(event) => {
              const currentIndex = SHARE_TABS.findIndex((t) => t.value === tab);
              if (event.key === "ArrowRight") {
                const nextIndex = (currentIndex + 1) % SHARE_TABS.length;
                setTab(SHARE_TABS[nextIndex].value);
              } else if (event.key === "ArrowLeft") {
                const prevIndex = (currentIndex - 1 + SHARE_TABS.length) % SHARE_TABS.length;
                setTab(SHARE_TABS[prevIndex].value);
              }
            }}
            className={`transition-colors ${tab === tabItem.value ? "text-primary" : "text-muted-foreground"}`}>
            {tabItem.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`share-panel-${tab}`} aria-labelledby={`share-tab-${tab}`}>
        {tab === "members" ? (
          <>
            {isLeaving ? (
              <p className="text-muted-foreground text-xs" aria-live="polite">
                Leaving planner…
              </p>
            ) : null}
            {isLoading ? <p className="text-muted-foreground text-xs">Loading members…</p> : null}
            {error ? <p className="text-destructive text-xs">Unable to load members.</p> : null}
            {shouldShowEmpty ? <p className="text-muted-foreground text-xs">No members yet.</p> : null}
            {shouldShowList ? (
              <div className={`space-y-2 ${isLeaving ? "pointer-events-none opacity-50" : ""}`}>
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
    </div>
  );
}
