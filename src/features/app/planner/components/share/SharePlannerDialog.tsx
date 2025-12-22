'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';

import { Popover, PopoverContent, PopoverHeader, PopoverTriggerButton } from '@/shared/ui/popover';
import { Avatar } from '@/shared/ui/avatar';
import { Check, Link2, Share2, X } from '@/shared/ui/icon';
import { Button } from '@/shared/ui/button';
import { usePlanMembers, usePlanShareLink } from '@/features/app/planner/hooks/data/usePlanSharing';
import { usePlannerContext } from '@/features/app/planner/hooks/PlannerContext';
import { supabase } from '@/shared/lib/supabaseClient';
import { ensureProfile } from '@/server/actions/profile/ensureProfile';
import { SelectMenu, type SelectMenuOption } from '@/shared/ui/select';

const tiers = [
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
] as const;

function ShareLinkContent({
  planId,
  canManageMembers,
}: {
  planId: string;
  canManageMembers: boolean;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<number | null>(null);
  const { data, isLoading, createLink, revokeLink } = usePlanShareLink(planId, {
    enabled: Boolean(planId) && canManageMembers,
  });
  const hasLink = Boolean(data?.token);
  const isCreating = !hasLink && (createLink.isPending || isLoading);

  useEffect(() => {
    setCopied(false);
  }, [data?.token]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  if (!canManageMembers) {
    return (
      <div className="border-border bg-muted/30 rounded-md border p-3 text-sm">
        <div className="flex items-start gap-3">
          <span className="bg-muted text-muted-foreground inline-flex h-12 w-12 items-center justify-center rounded-md">
            <Link2 className="size-6" aria-hidden="true" />
          </span>
          <div className="flex-1">
            <p className="text-foreground">Share this planner with a link</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Only admins can generate access links.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-border bg-muted/30 rounded-md border p-2 text-sm">
      <div className="flex items-start gap-3">
        <span className="bg-muted text-muted-foreground inline-flex h-10 w-10 items-center justify-center rounded-md">
          <Link2 className="size-5" aria-hidden="true" />
        </span>
        <div className="flex-1">
          <p className="text-foreground">Share this planner with a link</p>
          <div className="mt-1 inline-flex items-center gap-2 text-xs font-medium">
            <button
              type="button"
              className={`inline-flex cursor-pointer items-center gap-2 hover:underline disabled:cursor-not-allowed disabled:opacity-60 ${
                copied ? 'text-foreground' : 'text-primary'
              }`}
              disabled={isCreating}
              onClick={async () => {
                if (!data?.token) {
                  createLink.mutate();
                  return;
                }
                try {
                  const url = `${window.location.origin}/p/share/${data.token}`;
                  await navigator.clipboard.writeText(url);
                  setCopied(true);
                  if (copyTimeoutRef.current) {
                    window.clearTimeout(copyTimeoutRef.current);
                  }
                  copyTimeoutRef.current = window.setTimeout(() => {
                    setCopied(false);
                  }, 2000);
                } catch {
                  setCopied(false);
                }
              }}
            >
              {hasLink ? (copied ? 'Copied' : 'Copy link') : 'Create link'}
              {hasLink && copied ? <Check className="size-4" aria-hidden="true" /> : null}
            </button>
            {hasLink ? (
              <>
                <span className="text-muted-foreground">·</span>
                <Popover open={confirmOpen} onOpenChange={setConfirmOpen}>
                  <PopoverTriggerButton className="text-destructive cursor-pointer hover:underline">
                    Delete link
                  </PopoverTriggerButton>
                  <PopoverContent side="bottom" align="end" sideOffset={8} className="w-72">
                    <PopoverHeader
                      title="Delete shared link"
                      onClose={() => setConfirmOpen(false)}
                    />
                    <div className="space-y-3 p-3 text-sm">
                      <p className="text-foreground">
                        Deleting this link will prevent anyone from using it to join the planner.
                      </p>
                      <Button
                        className="bg-destructive hover:bg-destructive/90 w-full text-[--destructive-foreground]"
                        onClick={() => {
                          revokeLink.mutate();
                          setConfirmOpen(false);
                        }}
                        disabled={revokeLink.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function MembersList({ planId }: { planId: string }) {
  const { data, isLoading, error, updateTier, removeMember, leave } = usePlanMembers(planId, {
    enabled: Boolean(planId),
  });
  const { viewerUserId, canManageMembers } = usePlannerContext();
  const router = useRouter();

  const ownerId = data?.ownerId ?? null;
  const members = data?.members ?? [];
  const adminCount = members.filter((member) => member.tier === 'admin').length;

  const resolveRedirectHref = async (member: (typeof members)[number]) => {
    if (member.slug) {
      return `/u/${member.slug}/planners`;
    }
    if (!viewerUserId) {
      return '/';
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('slug')
      .eq('id', viewerUserId)
      .maybeSingle();
    if (profile?.slug) {
      return `/u/${profile.slug}/planners`;
    }
    try {
      const slug = await ensureProfile();
      return `/u/${slug}/planners`;
    } catch {
      return '/';
    }
  };

  const handleLeave = async (member: (typeof members)[number]) => {
    const redirectHref = await resolveRedirectHref(member);
    try {
      await leave.mutateAsync();
      router.push(redirectHref);
      router.refresh();
    } catch {
      // keep user in place if leaving fails
    }
  };

  if (isLoading) {
    return <p className="text-muted-foreground text-xs">Loading members...</p>;
  }

  if (error) {
    return <p className="text-destructive text-xs">Unable to load members.</p>;
  }

  if (!members.length) {
    return <p className="text-muted-foreground text-xs">No members yet.</p>;
  }

  return (
    <div className="space-y-2">
      {members.map((member) => {
        const isPlanOwner = ownerId === member.userId;
        const isSelf = viewerUserId === member.userId;
        const isSelfAdmin = isSelf && member.tier === 'admin';
        const isLastAdmin = member.tier === 'admin' && adminCount <= 1;
        const canRemove = canManageMembers && !isPlanOwner && !isSelf;
        const canSelfLeave =
          isSelf && (!isSelfAdmin || adminCount > 1) && (!isPlanOwner || adminCount > 1);
        const canSelect =
          (!isPlanOwner && (canManageMembers || isSelf)) || (isPlanOwner && canSelfLeave);
        const tierOptions =
          isPlanOwner || isLastAdmin ? tiers.filter((tier) => tier.value === 'admin') : tiers;
        type MemberMenuOption = 'admin' | 'member' | 'leave' | 'remove';
        const menuOptions: SelectMenuOption<MemberMenuOption>[] = [
          ...tierOptions.map((tierOption) => ({
            value: tierOption.value,
            label: tierOption.label,
          })),
          ...(canSelfLeave ? [{ value: 'leave' as const, label: 'Leave planner' }] : []),
          ...(canRemove ? [{ value: 'remove' as const, label: 'Remove member' }] : []),
        ];
        const displayName = member.displayName ?? (isPlanOwner ? 'Owner' : 'User');
        return (
          <div
            key={member.userId}
            className="bg-background flex items-center justify-between gap-3 rounded-md py-2"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Avatar size="lg" displayName={displayName} />
              <div className="min-w-0">
                <p className="text-foreground truncate text-sm font-medium">
                  {displayName}
                  {isPlanOwner ? ' (owner)' : ''}
                </p>
                {member.slug ? (
                  <p className="text-muted-foreground truncate text-xs">@{member.slug}</p>
                ) : null}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SelectMenu
                value={member.tier}
                options={menuOptions}
                onChange={(nextValue) => {
                  if (nextValue === 'leave' && canSelfLeave) {
                    void handleLeave(member);
                    return;
                  }
                  if (nextValue === 'remove' && canRemove) {
                    removeMember.mutate({ userId: member.userId });
                    return;
                  }
                  if (!canManageMembers) {
                    return;
                  }
                  if (isPlanOwner) {
                    return;
                  }
                  updateTier.mutate({
                    userId: member.userId,
                    tier: nextValue as 'admin' | 'member',
                  });
                }}
                disabled={
                  !canSelect || updateTier.isPending || leave.isPending || removeMember.isPending
                }
                ariaLabel={`${displayName} role`}
                triggerClassName="w-28 shrink-0"
                contentClassName="w-38"
                align="end"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function SharePlannerDialog({ planId }: { planId: string }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'members' | 'requests'>('members');
  const [email, setEmail] = useState('');
  const [tier, setTier] = useState<'admin' | 'member'>('member');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const successTimeoutRef = useRef<number | null>(null);
  const { addMember, isLoading } = usePlanMembers(planId, {
    enabled: open,
  });
  const { canManageMembers } = usePlannerContext();

  useEffect(() => {
    if (!open) {
      setEmail('');
      setTier('member');
      setFormError('');
      setFormSuccess('');
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        window.clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="text-foreground hover:bg-muted/60 inline-flex size-10 cursor-pointer items-center justify-center rounded-sm px-2 transition-colors"
          aria-label="Share planner"
        >
          <Share2 className="size-5" aria-hidden="true" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          data-radix-dialog-overlay=""
          className="bg-background/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in data-[state=closed]:fade-out fixed inset-0 z-40 backdrop-blur-sm"
        />
        <Dialog.Content className="bg-background text-foreground fixed top-1/2 left-1/2 z-50 w-[96vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border shadow-xl focus:outline-none">
          <div className="border-border flex items-center justify-between border-b px-4 py-3">
            <Dialog.Title className="text-base font-semibold">Share planner</Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="text-muted-foreground hover:bg-muted/60 hover:text-foreground inline-flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>
          <div className="max-h-[75vh] space-y-4 overflow-y-auto p-4">
            <form
              className="flex w-full flex-nowrap items-center gap-2"
              onSubmit={async (event) => {
                event.preventDefault();
                if (!canManageMembers) {
                  return;
                }
                const trimmedEmail = email.trim();
                if (!trimmedEmail) {
                  setFormError('Enter a valid email.');
                  return;
                }
                try {
                  await addMember.mutateAsync({ email: trimmedEmail, tier });
                  setEmail('');
                  setFormError('');
                  setFormSuccess('Member added.');
                  if (successTimeoutRef.current) {
                    window.clearTimeout(successTimeoutRef.current);
                  }
                  successTimeoutRef.current = window.setTimeout(() => {
                    setFormSuccess('');
                  }, 3000);
                } catch (error) {
                  const message =
                    typeof error === 'object' && error && 'message' in error
                      ? String((error as { message?: unknown }).message ?? '')
                      : String(error);
                  const errorCode =
                    typeof error === 'object' && error && 'code' in error
                      ? String((error as { code?: unknown }).code ?? '')
                      : '';
                  const normalizedMessage = message.toLowerCase();
                  if (
                    normalizedMessage.includes('not registered') ||
                    normalizedMessage.includes('user not found') ||
                    normalizedMessage.includes('no user') ||
                    normalizedMessage.includes('user_not_registered') ||
                    errorCode === '23503' ||
                    errorCode === 'USER_NOT_REGISTERED'
                  ) {
                    setFormError(
                      'This email has no account yet. Ask them to sign up first, then invite again.'
                    );
                  } else {
                    setFormError('We could not add this member. Please try again.');
                  }
                  setFormSuccess('');
                }
              }}
            >
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (formError) {
                    setFormError('');
                  }
                  if (formSuccess) {
                    setFormSuccess('');
                  }
                }}
                className="border-border bg-background text-foreground min-w-0 flex-1 rounded-md border px-3 py-2 text-sm"
                disabled={!canManageMembers}
              />
              <SelectMenu
                value={tier}
                options={tiers}
                onChange={setTier}
                disabled={!canManageMembers}
                ariaLabel="Select member role"
                triggerClassName="w-28 shrink-0"
                contentClassName="w-28"
              />
              <Button
                type="submit"
                className="shrink-0"
                disabled={!canManageMembers || addMember.isPending || isLoading}
              >
                Share
              </Button>
            </form>
            {!canManageMembers ? (
              <p className="text-muted-foreground text-xs">Only admins can invite people.</p>
            ) : null}
            {formSuccess ? (
              <p className="text-foreground text-xs" role="status">
                {formSuccess}
              </p>
            ) : null}
            {formError ? (
              <p className="text-destructive text-xs" role="alert">
                {formError}
              </p>
            ) : null}

            <ShareLinkContent planId={planId} canManageMembers={canManageMembers} />

            <div className="border-border flex items-center gap-3 border-b pb-2 text-sm font-medium">
              <button
                type="button"
                onClick={() => setTab('members')}
                className={`transition-colors ${tab === 'members' ? 'text-primary' : 'text-muted-foreground'}`}
              >
                Members
              </button>
              <button
                type="button"
                onClick={() => setTab('requests')}
                className={`transition-colors ${tab === 'requests' ? 'text-primary' : 'text-muted-foreground'}`}
              >
                Requests
              </button>
            </div>

            {tab === 'members' ? (
              <MembersList planId={planId} />
            ) : (
              <p className="text-muted-foreground text-xs">No requests yet.</p>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
