// src/components/ui/button-icons/CalculatorButton.tsx

'use client';

import React from 'react';
import { Calculator } from 'lucide-react';
import { Button } from '@/components';

export default function CalculatorButton(props: React.ComponentProps<'button'>) {
  const handleClick = () => {
    if (typeof window !== 'undefined') {
      window.open('https://www.google.com/search?q=calculator', '_blank', 'noopener');
    }
  };

  return (
    <Button variant="icon" size="icon" title="Open calculator" onClick={handleClick} {...props}>
      <Calculator aria-hidden="true" />
    </Button>
  );
}
