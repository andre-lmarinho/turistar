'use client';

import { useEffect, useRef, useState } from 'react';

import { Popover, PopoverContent, PopoverHeader, PopoverTriggerButton } from '@/shared/ui/popover';
import { Check, Link2 } from '@/shared/ui/icon';
import { Button } from '@/shared/ui/button';
import { usePlanShareLink } from '@/features/app/planner/hooks/data/usePlanSharing';
import { usePlannerContext } from '@/features/app/planner/hooks/PlannerContext';

export function ShareLinkSection({ planId }: { planId: string }) {
  const { canManageMembers } = usePlannerContext();
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
