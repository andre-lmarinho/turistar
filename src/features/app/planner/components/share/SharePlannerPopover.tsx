'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Popover, PopoverContent, PopoverHeader, PopoverTriggerButton } from '@/shared/ui/popover';
import { Avatar } from '@/shared/ui/avatar';
import { Check, Link2, Share2, Trash2 } from '@/shared/ui/icon';
import { Button } from '@/shared/ui/button';
import { usePlanMembers, usePlanShareLink } from '@/features/app/planner/hooks/data/usePlanSharing';
import { usePlannerContext } from '@/features/app/planner/hooks/PlannerContext';
import { supabase } from '@/shared/lib/supabaseClient';
import { ensureProfile } from '@/server/actions/profile/ensureProfile';

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
          <span className="bg-muted text-muted-foreground inline-flex h-8 w-8 items-center justify-center rounded-md">
            <Link2 className="size-4" aria-hidden="true" />
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
    <div className="border-border bg-muted/30 rounded-md border p-3 text-sm">
      <div className="flex items-start gap-3">
        <span className="bg-muted text-muted-foreground inline-flex h-8 w-8 items-center justify-center rounded-md">
          <Link2 className="size-4" aria-hidden="true" />
        </span>
        <div className="flex-1">
          <p className="text-foreground">Share this planner with a link</p>
          {data?.token ? (
            <button
              type="button"
              className={`mt-1 inline-flex items-center gap-2 text-xs font-medium ${copied ? 'text-foreground' : 'text-primary'}`}
              onClick={async () => {
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
              {copied ? 'Copied' : 'Copy link'}
              {copied ? <Check className="size-4" aria-hidden="true" /> : null}
            </button>
          ) : (
            <p className="text-muted-foreground mt-1 text-xs">
              Generate a link to allow direct access as a member.
            </p>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        {data?.token ? (
          <Popover open={confirmOpen} onOpenChange={setConfirmOpen}>
            <PopoverTriggerButton className="border-border text-foreground hover:bg-muted/60 inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium">
              Delete link
              <Trash2 className="size-4" aria-hidden="true" />
            </PopoverTriggerButton>
            <PopoverContent side="bottom" align="end" sideOffset={8} className="w-72">
              <div className="space-y-3 text-sm">
                <p className="text-foreground">This link will be deleted permanently.</p>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="border-border text-foreground hover:bg-muted/60 inline-flex items-center rounded-md border px-3 py-2 text-xs font-medium"
                    onClick={() => setConfirmOpen(false)}
                  >
                    Cancel
                  </button>
                  <Button
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => {
                      revokeLink.mutate();
                      setConfirmOpen(false);
                    }}
                    disabled={revokeLink.isPending}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <Button
            className="w-full"
            onClick={() => createLink.mutate()}
            disabled={createLink.isPending || isLoading}
          >
            Create link
          </Button>
        )}
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
        const selectId = `tier-${member.userId}`;
        const canRemove = canManageMembers && !isPlanOwner && !isSelf;
        const canSelfLeave =
          isSelf && (!isSelfAdmin || adminCount > 1) && (!isPlanOwner || adminCount > 1);
        const canSelect =
          (!isPlanOwner && (canManageMembers || isSelf)) || (isPlanOwner && canSelfLeave);
        const tierOptions =
          isPlanOwner || isLastAdmin
            ? tiers.filter((tier) => tier.value === 'admin')
            : tiers;
        const displayName = member.displayName ?? (isPlanOwner ? 'Owner' : 'User');
        return (
          <div
            key={member.userId}
            className="border-border bg-background flex items-center justify-between gap-3 rounded-md border px-3 py-2"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Avatar displayName={displayName} />
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
              <select
                id={selectId}
                className="border-border bg-background text-foreground rounded-md border px-2 py-1 text-xs"
                value={member.tier}
                onChange={(event) => {
                  const nextValue = event.target.value;
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
              >
                {tierOptions.map((tier) => (
                  <option key={tier.value} value={tier.value}>
                    {tier.label}
                  </option>
                ))}
                {canSelfLeave ? <option value="leave">Leave planner</option> : null}
                {canRemove ? <option value="remove">Remove member</option> : null}
              </select>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function SharePlannerPopover({ planId }: { planId: string }) {
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTriggerButton
        className="text-foreground hover:bg-muted/60 inline-flex size-10 cursor-pointer items-center justify-center rounded-sm px-2 transition-colors"
        aria-label="Share planner"
      >
        <Share2 className="size-5" aria-hidden="true" />
      </PopoverTriggerButton>
      <PopoverContent className="w-105 p-0" side="bottom" align="end" sideOffset={8}>
        <PopoverHeader title="Share planner" onClose={() => setOpen(false)} />
        <div className="space-y-4 p-4">
          <form
            className="flex items-center gap-2"
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
              className="border-border bg-background text-foreground flex-1 rounded-md border px-3 py-2 text-sm"
              disabled={!canManageMembers}
            />
            <select
              value={tier}
              onChange={(event) => setTier(event.target.value as 'admin' | 'member')}
              className="border-border bg-background text-foreground rounded-md border px-2 py-2 text-sm"
              disabled={!canManageMembers}
            >
              {tiers.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button type="submit" disabled={!canManageMembers || addMember.isPending || isLoading}>
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
      </PopoverContent>
    </Popover>
  );
}
