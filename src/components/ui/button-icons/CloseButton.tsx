// src/components/ui/CloseButton.tsx
'use client';

import { X } from 'lucide-react';
import { Button } from '@/components';

export default function CloseButton(props: React.ComponentProps<'button'>) {
  return (
    <Button variant="icon" size="icon" title="Close" {...props}>
      <X className="group-hover/icon:rotate-90" />
    </Button>
  );
}
