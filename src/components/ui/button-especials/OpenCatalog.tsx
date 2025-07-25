// src/components/ui/button-especials/OpenCatalog.tsx
'use client';

import React from 'react';
import { Compass } from 'lucide-react';
import { Button } from '@/components';

import type { DayPlan } from '@/types';

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

    return (
      <button
        type="button"
        ref={ref}
        onClick={onClick}
        aria-label={buttonTitle}
        className={`flex group cursor-pointer items-center gap-2 px-6 py-2 rounded hover:opacity-90 transition-colors ${
          isEmpty ? 'animate-bounce' : ''
        } bg-[var(--primary)] text-[var(--primary-foreground)]`}
      >
        <Compass
          size={18}
          aria-hidden="true"
          className="group-hover:rotate-135 transform transition duration-300 group-hover/icon:scale-105"
        />
        <span className="text-xl handcrafted whitespace-nowrap">{buttonTitle}</span>
      </button>
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
