'use client';

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';

import { OnboardingCarousel } from './OnboardingCarousel';
import { useOnboardingContext } from '../hooks/OnboardingContext';
import { X } from '@/shared/ui/icon';

export function OnboardingDialog() {
  const { showOnboarding: open, setShowOnboarding } = useOnboardingContext();
  const onClose = () => setShowOnboarding(false);

  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-background/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in data-[state=closed]:fade-out fixed inset-0 z-40 backdrop-blur-sm" />
        <Dialog.Content
          aria-labelledby="onboarding-carousel-title"
          aria-describedby="onboarding-carousel-description"
          className="bg-background focus-visible:ring-primary fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl p-4 shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          <Dialog.Title id="onboarding-carousel-title" className="sr-only">
            Welcome to the planner onboarding
          </Dialog.Title>
          <Dialog.Description id="onboarding-carousel-description" className="sr-only">
            Follow the onboarding steps to learn how to use the travel planner.
          </Dialog.Description>

          <Dialog.Close asChild>
            <button
              type="button"
              aria-label="Close"
              className="text-muted-foreground hover:text-foreground hover:bg-muted/60 focus-visible:outline-primary absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </Dialog.Close>

          <div className="flex items-center justify-center">
            <OnboardingCarousel baseWidth={384} onFinish={onClose} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
