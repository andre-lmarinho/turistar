// src/shared/ui/button-icons/DeleteCardButton.tsx
'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui';

export default function DeleteCardButton(props: React.ComponentProps<'button'>) {
  return (
    <Button variant="icon" size="icon" title="Delete" {...props}>
      <Trash2 aria-hidden="true" />
    </Button>
  );
}
