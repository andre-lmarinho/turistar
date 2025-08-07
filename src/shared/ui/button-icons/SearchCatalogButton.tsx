// src/shared/ui/button-icons/SearchCatalogButton.tsx
'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/shared/ui';

export default function EditCardButton(props: React.ComponentProps<'button'>) {
  return (
    <Button variant="icon" size="icon" title="Search" {...props}>
      <Search aria-hidden="true" />
    </Button>
  );
}
