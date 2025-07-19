// src/components/ui/buttonTooltip.tsx
'use client';

import React from 'react';
import ReactDOM from 'react-dom';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
  className?: string;
  position?: 'top' | 'bottom';
}

export default function Tooltip({ content, children, className, position = 'top' }: TooltipProps) {
  const [visible, setVisible] = React.useState(false);
  const [coords, setCoords] = React.useState({ x: 0, y: 0 });
  const tooltipId = React.useId();

  const show = (e: React.MouseEvent<HTMLElement> | React.FocusEvent<HTMLElement>) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

    setCoords({
      x: rect.left + rect.width / 2,
      y: position === 'bottom' ? rect.bottom : rect.top,
    });
    setVisible(true);
  };

  const hide = () => setVisible(false);

  const trigger = React.cloneElement(children, {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      children.props.onMouseEnter?.(e);
      show(e);
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      children.props.onMouseLeave?.(e);
      hide();
    },
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      children.props.onFocus?.(e);
      show(e);
    },
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      children.props.onBlur?.(e);
      hide();
    },
    'aria-describedby': tooltipId,
  });

  return (
    <>
      {trigger}
      {visible &&
        ReactDOM.createPortal(
          <div
            id={tooltipId}
            className={cn(
              'pointer-events-none absolute z-50 -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-[10px] text-white',
              position === 'bottom' ? 'translate-y-[6px]' : '-translate-y-[calc(100%+6px)]',
              className
            )}
            style={{ left: coords.x, top: coords.y }}
            role="tooltip"
          >
            {content}
          </div>,
          document.body
        )}
    </>
  );
}
