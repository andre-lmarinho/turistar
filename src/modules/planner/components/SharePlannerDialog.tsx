"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { SubmitEvent } from "react";
import { useId, useRef, useState } from "react";
import type { ShareMember, ShareTier } from "@/features/members/types";
import { SHARE_TIER_OPTIONS } from "@/features/members/types";
import { trpc } from "@/trpc/react";
import { Avatar } from "@/ui/components/avatar";
import { Button } from "@/ui/components/button";
import { Dialog, DialogContent, DialogHeader, DialogTriggerButton } from "@/ui/components/dialog";
import { ConfirmationDialog } from "@/ui/components/dialog/ConfirmationDialog";
import { Share2 } from "@/ui/components/icon";
import { Spinner } from "@/ui/components/loading/Spinner";
import { cn } from "@/ui/utils/cn";

export function SharePlannerDialog({
  planId,
  canManageMembers,
  viewerUserId,
}: {
  planId: string;
  canManageMembers: boolean;
  viewerUserId: string | null;
}) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const members = useShareMembers(planId, open);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!members.isMutating) setOpen(nextOpen);
      }}>
      <DialogTriggerButton
        type="button"
        className="text-foreground hover:bg-interactive-hover inline-flex size-11 cursor-pointer items-center justify-center rounded-sm px-2 transition-colors md:size-8"
        aria-label={t("sharePlanner")}>
        <Share2 className="size-4" aria-hidden="true" />
      </DialogTriggerButton>
      <DialogContent>
        <DialogHeader
          title={t("sharePlanner")}
          description={t("sharePlannerDescription")}
          closeDisabled={members.isMutating}
        />
        <div className="space-y-4 p-4">
          <InviteForm planId={planId} canManageMembers={canManageMembers} members={members} />
          <MembersSection
            planId={planId}
            canManageMembers={canManageMembers}
            viewerUserId={viewerUserId}
            members={members}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

type SelectMenuProps<T extends string> = {
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (value: T) => void;
  ariaLabel: string;
  disabled?: boolean;
};

function SelectMenu<T extends string>({ value, options, onChange, ariaLabel, disabled }: SelectMenuProps<T>) {
  return (
    <select
      value={value}
      aria-label={ariaLabel}
      disabled={disabled}
      onChange={(event) => {
        const option = options.find((item) => item.value === event.target.value);
        if (option) onChange(option.value);
      }}
      className="border-input bg-background text-foreground min-h-11 w-32 shrink-0 rounded-md border px-3 py-2 text-base focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 md:min-h-9 md:text-sm">
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function InviteForm({
  planId,
  canManageMembers,
  members,
}: {
  planId: string;
  canManageMembers: boolean;
  members: ReturnType<typeof useShareMembers>;
}) {
  const t = useTranslations();
  const { addMember, isLoading, isMutating } = members;
  const emailId = useId();
  const emailRef = useRef<HTMLInputElement>(null);
  const requestPending = useRef(false);

  const getInviteErrorMessage = (error: unknown) => {
    const errorCode =
      typeof error === "object" && error && "code" in error
        ? String((error as { code?: unknown }).code ?? "")
        : "";

    if (errorCode === "USER_NOT_REGISTERED") {
      return t("userNotRegistered");
    }

    return t("addMemberFailed");
  };
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState<ShareTier>("member");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const clearMessages = () => {
    setFormError("");
    setFormSuccess("");
  };

  const showSuccess = (message: string) => {
    setFormSuccess(message);
    setFormError("");
  };

  const showError = (message: string) => {
    setFormError(message);
    setFormSuccess("");
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canManageMembers || requestPending.current || isMutating || isLoading) {
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !emailRef.current?.validity.valid) {
      showError(t("enterValidEmail"));
      emailRef.current?.focus();
      return;
    }

    requestPending.current = true;
    clearMessages();
    try {
      await addMember.mutateAsync({ planIdOrSlug: planId, email: trimmedEmail, tier });
      setEmail("");
      showSuccess(t("memberAdded"));
    } catch (error) {
      showError(getInviteErrorMessage(error));
    } finally {
      requestPending.current = false;
    }
  };

  return (
    <div className="space-y-2">
      <form
        className="flex w-full flex-wrap items-center gap-2"
        onSubmit={handleSubmit}
        noValidate
        aria-busy={addMember.isPending}>
        <label htmlFor={emailId} className="sr-only">
          {t("emailAddressPlaceholder")}
        </label>
        <input
          id={emailId}
          ref={emailRef}
          type="email"
          required
          aria-invalid={
            formError === t("enterValidEmail") || formError === t("userNotRegistered") || undefined
          }
          aria-describedby={formError ? `${emailId}-error` : undefined}
          name="email"
          autoComplete="email"
          spellCheck={false}
          placeholder={t("emailAddressPlaceholder")}
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (formError || formSuccess) {
              clearMessages();
            }
          }}
          className="border-input bg-background text-foreground min-h-11 min-w-0 basis-full rounded-md border px-3 py-2 text-base md:min-h-9 md:flex-1 md:basis-auto md:text-sm"
          disabled={!canManageMembers || isLoading}
          readOnly={isMutating}
        />
        <SelectMenu
          value={tier}
          options={SHARE_TIER_OPTIONS.map((option) => ({ ...option, label: t(option.label) }))}
          onChange={setTier}
          disabled={!canManageMembers || isMutating || isLoading}
          ariaLabel={t("selectMemberRole")}
        />
        <Button
          type="submit"
          className="ml-auto shrink-0 gap-2"
          aria-busy={addMember.isPending}
          disabled={!canManageMembers || isLoading}
          aria-disabled={isMutating}>
          {addMember.isPending ? <Spinner className="size-4" /> : null}
          {t("shareButton")}
        </Button>
      </form>
      {!canManageMembers ? <p className="text-muted-foreground text-xs">{t("onlyAdminsInvite")}</p> : null}
      {formSuccess ? (
        <output className="text-foreground block text-xs" aria-live="polite">
          {formSuccess}
        </output>
      ) : null}
      {formError ? (
        <p id={`${emailId}-error`} className="text-destructive-text text-xs" role="alert">
          {formError}
        </p>
      ) : null}
    </div>
  );
}

type MemberMenuOption = ShareTier | "leave" | "remove";

const LEAVE_OPTION = {
  value: "leave",
  label: "leavePlanner",
} as const;
const REMOVE_OPTION = {
  value: "remove",
  label: "removeMember",
} as const;

const isTier = (value: MemberMenuOption): value is ShareTier => value === "admin" || value === "member";

type MemberMutations = Pick<ReturnType<typeof useShareMembers>, "updateTier" | "removeMember" | "leave">;

type TierOptionsParams = {
  canManageMembers: boolean;
  isSelf: boolean;
  isOwner: boolean;
  isLastAdmin: boolean;
  currentTier: ShareTier;
};

const getTierOptions = ({
  canManageMembers,
  isSelf,
  isOwner,
  isLastAdmin,
  currentTier,
}: TierOptionsParams) => {
  if (!canManageMembers && isSelf) {
    return SHARE_TIER_OPTIONS.filter((tierOption) => tierOption.value === currentTier);
  }

  if (isOwner || isLastAdmin) {
    return SHARE_TIER_OPTIONS.filter((tierOption) => tierOption.value === "admin");
  }

  return SHARE_TIER_OPTIONS;
};

type ShareMemberRowProps = {
  planId: string;
  member: ShareMember;
  ownerId: string | null;
  adminCount: number;
  viewerUserId: string | null;
  canManageMembers: boolean;
  mutations: MemberMutations;
  isMutating: boolean;
};

function ShareMemberRow({
  member,
  planId,
  ownerId,
  adminCount,
  viewerUserId,
  canManageMembers,
  mutations,
  isMutating,
}: ShareMemberRowProps) {
  const t = useTranslations();
  const isOwner = ownerId === member.userId;
  const isSelf = viewerUserId === member.userId;
  const isAdmin = member.tier === "admin";
  const isLastAdmin = isAdmin && adminCount <= 1;
  const isAdminOrOwner = isAdmin || isOwner;
  const canManageMember = canManageMembers && !isOwner;
  const canRemove = canManageMember && !isSelf;
  const canSelfLeave = isSelf && (!isAdminOrOwner || adminCount > 1);
  const canSelect = isOwner ? canSelfLeave : canManageMembers || isSelf;
  const tierOptions = getTierOptions({
    canManageMembers,
    isSelf,
    isOwner,
    isLastAdmin,
    currentTier: member.tier,
  });
  const menuOptions = [
    ...tierOptions,
    ...(canSelfLeave ? [LEAVE_OPTION] : []),
    ...(canRemove ? [REMOVE_OPTION] : []),
  ].map((option) => ({ ...option, label: t(option.label) }));
  const displayName = member.displayName ?? (isOwner ? t("ownerFallback") : t("userFallback"));
  const displayLabel = isOwner ? `${displayName} ${t("ownerSuffix")}` : displayName;
  const [confirmation, setConfirmation] = useState<"leave" | "remove" | null>(null);

  const handleMenuChange = (nextValue: MemberMenuOption) => {
    if (isMutating) return;
    if (nextValue === "leave") {
      if (canSelfLeave) setConfirmation("leave");
      return;
    }
    if (nextValue === "remove") {
      if (canRemove) setConfirmation("remove");
      return;
    }

    if (!canManageMember || !isTier(nextValue)) {
      return;
    }

    mutations.updateTier.mutate({
      planIdOrSlug: planId,
      userId: member.userId,
      tier: nextValue,
    });
  };

  return (
    <div className="bg-background flex items-center justify-between gap-3 rounded-md py-2">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar size="lg" displayName={displayName} />
        <div className="min-w-0">
          <p className="text-foreground truncate text-sm font-medium">{displayLabel}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <SelectMenu<MemberMenuOption>
          value={member.tier}
          options={menuOptions}
          onChange={handleMenuChange}
          disabled={!canSelect || isMutating}
          ariaLabel={t("memberRoleLabel", { name: displayName })}
        />
      </div>
      <ConfirmationDialog
        open={confirmation !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setConfirmation(null);
        }}
        title={t(confirmation === "leave" ? "leavePlanner" : "removeMember")}
        description={
          confirmation === "leave"
            ? t("leavePlannerConfirm")
            : t("removeMemberConfirm", { name: displayName })
        }
        confirmLabel={t(confirmation === "leave" ? "leavePlanner" : "removeMember")}
        cancelLabel={t("cancel")}
        closeLabel={t("close")}
        errorMessage={t("unableToUpdateMembers")}
        isPending={isMutating}
        onConfirm={async () => {
          if (confirmation === "leave") await mutations.leave.mutateAsync({ planIdOrSlug: planId });
          else await mutations.removeMember.mutateAsync({ planIdOrSlug: planId, userId: member.userId });
        }}
      />
    </div>
  );
}

function MembersSection({
  planId,
  canManageMembers,
  viewerUserId,
  members: query,
}: {
  planId: string;
  canManageMembers: boolean;
  viewerUserId: string | null;
  members: ReturnType<typeof useShareMembers>;
}) {
  const t = useTranslations();
  const { data, isLoading, error, updateTier, removeMember, leave, isMutating, isFetching, refetch } = query;
  const memberMutations = { updateTier, removeMember, leave };
  const isLeaving = leave.isPending;
  const mutationError = updateTier.error || removeMember.error || leave.error;

  const ownerId = data?.ownerId ?? null;
  const members = data?.members ?? [];
  const adminCount = members.filter((member) => member.tier === "admin").length;
  const hasMembers = members.length > 0;
  const isReady = !isLoading && !error;
  const shouldShowEmpty = isReady && !hasMembers;
  const shouldShowList = isReady && hasMembers;

  return (
    <div className="space-y-3">
      {isLeaving ? (
        <p className="text-muted-foreground text-xs" aria-live="polite">
          {t("leavingPlanner")}
        </p>
      ) : null}
      {isLoading ? (
        <output className="text-muted-foreground flex items-center gap-2 text-sm">
          <Spinner className="size-4" />
          {t("loadingMembers")}
        </output>
      ) : null}
      {error ? (
        <div className="space-y-2">
          <p role="alert" className="text-destructive-text text-sm">
            {t("unableToLoadMembers")}
          </p>
          <Button
            variant="ghost"
            disabled={isFetching}
            aria-busy={isFetching}
            onClick={() => void refetch()}
            className="gap-2">
            {isFetching ? <Spinner className="size-4" /> : null}
            {t("retry")}
          </Button>
        </div>
      ) : null}
      {mutationError ? (
        <p role="alert" className="text-destructive-text text-xs">
          {t("unableToUpdateMembers")}
        </p>
      ) : null}
      {shouldShowEmpty ? <p className="text-muted-foreground text-xs">{t("noMembersYet")}</p> : null}
      {shouldShowList ? (
        <div aria-busy={isMutating} className={cn("space-y-2", isLeaving && "opacity-50")}>
          {members.map((member) => (
            <ShareMemberRow
              key={member.userId}
              planId={planId}
              member={member}
              ownerId={ownerId}
              adminCount={adminCount}
              viewerUserId={viewerUserId}
              canManageMembers={canManageMembers}
              mutations={memberMutations}
              isMutating={isMutating}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function useShareMembers(planId: string, enabled: boolean) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const query = trpc.viewer.members.get.useQuery({ planIdOrSlug: planId }, { enabled });

  const addMutation = trpc.viewer.members.add.useMutation({
    onSuccess: (result) => {
      utils.viewer.members.get.setData({ planIdOrSlug: planId }, (current) => {
        if (!current || current.members.some((member) => member.userId === result.userId)) return current;
        return {
          ...current,
          members: [
            ...current.members,
            {
              userId: result.userId,
              tier: result.tier,
              slug: null,
              displayName: null,
              avatarUrl: null,
            },
          ],
        };
      });
    },
    onSettled: () => utils.viewer.members.get.invalidate({ planIdOrSlug: planId }),
  });

  const updateMutation = trpc.viewer.members.update.useMutation({
    onMutate: async ({ userId, tier }) => {
      await utils.viewer.members.get.cancel({ planIdOrSlug: planId });
      const previous = utils.viewer.members.get.getData({ planIdOrSlug: planId });
      utils.viewer.members.get.setData({ planIdOrSlug: planId }, (current) => {
        if (!current) return current;
        return {
          ...current,
          members: current.members.map((member) => (member.userId === userId ? { ...member, tier } : member)),
        };
      });
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        utils.viewer.members.get.setData({ planIdOrSlug: planId }, context.previous);
      }
    },
    onSettled: () => utils.viewer.members.get.invalidate({ planIdOrSlug: planId }),
  });

  const removeMutation = trpc.viewer.members.remove.useMutation({
    onSuccess: (_result, { userId }) => {
      utils.viewer.members.get.setData(
        { planIdOrSlug: planId },
        (current) =>
          current && { ...current, members: current.members.filter((member) => member.userId !== userId) }
      );
    },
    onSettled: () => utils.viewer.members.get.invalidate({ planIdOrSlug: planId }),
  });

  const leaveMutation = trpc.viewer.members.leave.useMutation({
    onSuccess: (redirectTo) => {
      router.push(redirectTo);
      router.refresh();
      void utils.viewer.members.get.reset({ planIdOrSlug: planId });
    },
  });

  return {
    ...query,
    isMutating:
      addMutation.isPending ||
      updateMutation.isPending ||
      removeMutation.isPending ||
      leaveMutation.isPending,
    addMember: addMutation,
    updateTier: updateMutation,
    removeMember: removeMutation,
    leave: leaveMutation,
  };
}
