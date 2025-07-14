// src/components/ui/button-icons/EditCardButton.tsx

'use client';

import React from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components';

export default function EditCardButton(props: React.ComponentProps<'button'>) {
  return (
    <Button variant="iconrd" size="iconsm" title="Edit Card" position="bottom" {...props}>
      <Pencil />
    </Button>
  );
}
