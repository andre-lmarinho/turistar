// src/shared/ui/button-especials/OpenCatalog.tsx
'use client';

import React from 'react';
import { Compass } from 'lucide-react';
import { Button, TooltipKeyHint } from '@/shared/ui';
import { KEY_BINDS } from '@/shared/constants';
import type { DayPlan } from '@/shared/types';

interface OpenPanelButtonProps {
  onClick: () => void;
  title?: string;
  /**
   * Optional days array to determine if planner is empty.
   */
  days?: DayPlan[];
}

const OpenPanelButton = React.forwardRef<HTMLButtonElement, OpenPanelButtonProps>(
  function OpenPanelButton({ onClick, title = 'Add Adventures', days }, ref) {
    const isEmpty = days?.every((d) => d.activities.length === 0);
    const buttonTitle = isEmpty ? 'Start Here' : title;

    const button = (
      <button
        type="button"
        ref={ref}
        onClick={onClick}
        aria-label={buttonTitle}
        className={`group flex cursor-pointer items-center gap-2 rounded px-6 py-2 transition-colors hover:opacity-90 ${
          isEmpty ? 'animate-bounce' : ''
        } bg-[var(--primary)] text-[var(--primary-foreground)]`}
      >
        <Compass
          size={18}
          aria-hidden="true"
          className="transform transition duration-300 group-hover:rotate-135 group-hover/icon:scale-105"
        />
        <span className="handcrafted text-xl whitespace-nowrap">{buttonTitle}</span>
      </button>
    );
    return (
      <TooltipKeyHint shortcut={KEY_BINDS.catalog} content={buttonTitle} position="bottom">
        {button}
      </TooltipKeyHint>
    );
  }
);

const OpenPanelIcon = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> & { title?: string }
>(function OpenPanelIconButton({ title = 'Add Adventures', ...props }, ref) {
  return (
    <Button ref={ref} variant="icon" size="icon" position="bottom" title={title} {...props}>
      <Compass aria-hidden="true" />
    </Button>
  );
});

export { OpenPanelButton, OpenPanelIcon };
