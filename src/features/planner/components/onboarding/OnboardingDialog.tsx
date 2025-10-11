'use client';

import React from 'react';
import { X } from 'lucide-react';

import OnboardingCarousel from '@/features/planner/components/onboarding/OnboardingCarousel';
import { useOnboardingContext } from '@/features/planner/hooks/onboarding/OnboardingContext';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog';

export default function OnboardingDialog() {
  const { showOnboarding: open, setShowOnboarding } = useOnboardingContext();
  const onClose = () => setShowOnboarding(false);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent
        size="sm"
        className="relative max-w-sm p-4"
        aria-labelledby="onboarding-carousel-title"
        aria-describedby={undefined}
      >
        <DialogHeader className="sr-only">
          <DialogTitle id="onboarding-carousel-title">Welcome</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-end pb-4">
          <DialogClose asChild>
            <button
              type="button"
              title="Close"
              onClick={onClose}
              className="text-muted-foreground hover:bg-muted/60 hover:text-foreground inline-flex size-9 items-center justify-center rounded-full transition-colors"
            >
              <X className="size-4" aria-hidden="true" />
              <span className="sr-only">Close</span>
            </button>
          </DialogClose>
        </div>

        <div className="flex items-center justify-center">
          <OnboardingCarousel baseWidth={384} onFinish={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
