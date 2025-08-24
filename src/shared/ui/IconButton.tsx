// src/shared/ui/IconButton.tsx
'use client';

import React from 'react';
import { Button } from './button';

interface IconButtonProps
  extends Omit<React.ComponentProps<typeof Button>, 'variant' | 'size' | 'title' | 'children'> {
  icon: React.ReactNode;
  ariaLabel: string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, ariaLabel, ...props }, ref) => (
    <Button ref={ref} variant="icon" size="icon" title={ariaLabel} {...props}>
      {icon}
    </Button>
  )
);

IconButton.displayName = 'IconButton';

export default IconButton;
