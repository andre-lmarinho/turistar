// src/features/planner/components/onboarding/OnboardingDialog.tsx
'use client';

import React from 'react';
import OnboardingCarousel from '@/features/planner/components/onboarding/OnboardingCarousel';
import { useOnboardingContext } from '@/features/planner/hooks/onboarding/OnboardingContext';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';

export default function OnboardingDialog() {
  const { showOnboarding: open, setShowOnboarding } = useOnboardingContext();
  const onClose = () => setShowOnboarding(false);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      overlayClassName="backdrop-overlay"
      wrapperClassName="fixed inset-0 z-50 flex items-center justify-center"
      aria-labelledby="onboarding-carousel-title"
      className="focus:ring-primary bg-background relative max-w-sm rounded-lg p-4 shadow-xl focus:ring-2 focus:outline-none"
    >
      {/* Heading */}
      <h2 id="onboarding-carousel-title" className="sr-only">
        Welcome
      </h2>
      {/* Close button */}
      <div className="flex items-center justify-end pb-4">
        <Button type="button" variant="icon" size="icon" title="Close" icon="x" onClick={onClose} />
      </div>
      {/* Carousel */}
      <div className="flex items-center justify-center">
        <OnboardingCarousel baseWidth={384} onFinish={onClose} />
      </div>
    </Dialog>
  );
}
