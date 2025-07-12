// src/components/ui/IcoRemoveCard.tsx
'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components';

export default function DeleteCardButton(props: React.ComponentProps<'button'>) {
  return (
    <Button variant="icon" size="icon" title="Delete" {...props}>
      <Trash2 />
    </Button>
  );
}
