'use client';

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';

import { OnboardingCarousel } from '@/features/planner/components/onboarding/OnboardingCarousel';
import { useOnboardingContext } from '@/features/planner/hooks/onboarding/OnboardingContext';

export function OnboardingDialog() {
  const { showOnboarding: open, setShowOnboarding } = useOnboardingContext();
  const onClose = () => setShowOnboarding(false);

  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-background/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in data-[state=closed]:fade-out fixed inset-0 z-40 backdrop-blur-sm" />
        <Dialog.Content
          aria-labelledby="onboarding-carousel-title"
          className="bg-background focus-visible:ring-primary fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl p-4 shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          <Dialog.Title className="sr-only">Welcome Onboarding</Dialog.Title>

          <div className="flex items-center justify-center">
            <OnboardingCarousel baseWidth={384} onFinish={onClose} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
