'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { supabase } from '@/shared/lib/supabaseClient';
import { AvatarBadge } from '@/shared/ui/AvatarBadge';

type AvatarMenuProps = {
  displayName: string | null;
  email: string | null;
};

export function AvatarMenu({ displayName, email }: AvatarMenuProps) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="relative p-1">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="cursor-pointer"
        ref={buttonRef}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Account menu"
      >
        <AvatarBadge displayName={displayName} />
      </button>

      {open ? (
        <div
          ref={popoverRef}
          className="bg-card text-foreground border-border fixed z-50 w-64 rounded-xl border shadow-lg"
          style={{ top: '44px', right: '4px' }}
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <AvatarBadge displayName={displayName} size="lg" />
            <div className="min-w-0">
              <p className="text-sm leading-tight font-semibold">{displayName ?? 'Traveler'}</p>
              <p className="text-muted-foreground truncate text-xs">{email ?? 'Signed in'}</p>
            </div>
          </div>
          <div className="border-border border-t px-4 py-3">
            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Account
            </p>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-primary hover:text-primary/50 mt-2 inline-flex w-full cursor-pointer items-center gap-2 text-sm"
            >
              Log out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
