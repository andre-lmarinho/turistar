'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { supabase } from '@/shared/lib/supabaseClient';
import { AvatarBadge } from '@/shared/ui/AvatarBadge';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';

type AvatarMenuProps = {
  displayName: string | null;
  email: string | null;
};

export function AvatarMenu({ displayName, email }: AvatarMenuProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label="Account menu"
          className="cursor-pointer p-1"
        >
          <AvatarBadge displayName={displayName} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="border-border bg-card text-foreground w-64 rounded-xl border shadow-lg"
        side="bottom"
        align="end"
        sideOffset={4}
        alignOffset={0}
      >
        <div className="flex items-center gap-3 px-2 py-1">
          <AvatarBadge displayName={displayName} size="lg" />
          <div className="min-w-0">
            <p className="text-sm leading-tight font-semibold">{displayName ?? 'Traveler'}</p>
            <p className="text-muted-foreground truncate text-xs">{email ?? 'Signed in'}</p>
          </div>
        </div>
        <div className="border-border border-t px-2 py-3">
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Account
          </p>
          <button
            type="button"
            onClick={handleSignOut}
            className="text-primary hover:text-primary/80 mt-2 inline-flex w-full cursor-pointer items-center gap-2 text-sm"
          >
            Log out
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
