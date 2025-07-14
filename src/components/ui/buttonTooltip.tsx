// src/components/ui/buttonTooltips.tsx

'use client';

import React from 'react';
import ReactDOM from 'react-dom';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  className?: string;
  position?: 'top' | 'bottom';
}

export default function Tooltip({ content, children, className, position = 'top' }: TooltipProps) {
  const [visible, setVisible] = React.useState(false);
  const [coords, setCoords] = React.useState({ x: 0, y: 0 });
  const ref = React.useRef<HTMLElement | null>(null);

  const show = () => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setCoords({
      x: rect.left + rect.width / 2,
      y: position === 'bottom' ? rect.bottom : rect.top,
    });
    setVisible(true);
  };

  const hide = () => setVisible(false);

  const trigger = React.cloneElement(children, {
    ref,
    onMouseEnter: show,
    onMouseLeave: hide,
    onFocus: show,
    onBlur: hide,
  });

  const verticalTranslate =
    position === 'bottom' ? 'translate-y-1' : '-translate-y-[calc(100%+0.25rem)]';

  return (
    <>
      {trigger}
      {visible &&
        ReactDOM.createPortal(
          <div
            className={cn(
              'pointer-events-none absolute z-50 -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-[10px] text-white',
              verticalTranslate,
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
