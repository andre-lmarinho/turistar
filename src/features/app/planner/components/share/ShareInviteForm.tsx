'use client';

import { useEffect, useRef, useState } from 'react';

import { Button } from '@/shared/ui/button';
import { SelectMenu } from '@/shared/ui/select';
import { usePlanMembers } from '@/features/app/planner/hooks/data/usePlanSharing';
import { usePlannerContext } from '@/features/app/planner/hooks/PlannerContext';
import { SHARE_TIERS, type ShareTier } from './shareConstants';

export function ShareInviteForm({ planId }: { planId: string }) {
  const { canManageMembers } = usePlannerContext();
  const { addMember, isLoading } = usePlanMembers(planId, {
    enabled: Boolean(planId),
  });
  const [email, setEmail] = useState('');
  const [tier, setTier] = useState<ShareTier>('member');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const successTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        window.clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-2">
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
          options={SHARE_TIERS}
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
    </div>
  );
}
