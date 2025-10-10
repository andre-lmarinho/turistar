'use client';

import React from 'react';

import OnboardingCarousel from '@/features/planner/components/onboarding/OnboardingCarousel';
import { useOnboardingContext } from '@/features/planner/hooks/onboarding/OnboardingContext';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';

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
            <Button type="button" variant="icon" size="icon" title="Close" icon="x" onClick={onClose} />
          </DialogClose>
        </div>

        <div className="flex items-center justify-center">
          <OnboardingCarousel baseWidth={384} onFinish={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
