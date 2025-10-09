// src/features/planner/components/onboarding/OnboardingModal.tsx
'use client';

import React from 'react';
import OnboardingCarousel from '@/features/planner/components/onboarding/OnboardingCarousel';
import { useOnboardingContext } from '@/features/planner/hooks/onboarding/OnboardingContext';
import { Button } from '@/shared/ui/button';
import { Modal, ModalContent } from '@/shared/ui/modal';

export default function OnboardingModal() {
  const { showOnboarding: open, setShowOnboarding } = useOnboardingContext();
  const onClose = () => setShowOnboarding(false);

  return (
    <Modal open={open} onOpenChange={(isOpen) => {
      if (!isOpen) onClose();
    }}>
      <ModalContent
        aria-labelledby="onboarding-carousel-title"
        className="focus-visible:ring-primary relative max-w-sm rounded-lg p-4"
        overlayProps={{ className: 'backdrop-overlay' }}
      >
      {/* Heading */}
      <h2 id="onboarding-carousel-title" className="sr-only">
        Welcome
      </h2>
      {/* Close button */}
      <div className="flex items-center justify-end pb-4">
        <Button type="button" size="icon" title="Close" icon="x" onClick={onClose} />
      </div>
      {/* Carousel */}
      <div className="flex items-center justify-center">
        <OnboardingCarousel baseWidth={384} onFinish={onClose} />
      </div>
      </ModalContent>
    </Modal>
  );
}
