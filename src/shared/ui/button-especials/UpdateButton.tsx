// src/shared/ui/button-especials/UpdateButton.tsx
'use client';

import React from 'react';
import { Button } from '@/shared/ui/button';

export interface UpdateButtonProps extends React.ComponentProps<typeof Button> {
  ready: boolean;
}

export default function UpdateButton({ ready, children, ...props }: UpdateButtonProps) {
  return (
    <Button disabled={!ready} {...props}>
      {children}
    </Button>
  );
}
