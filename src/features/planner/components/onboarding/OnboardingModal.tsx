// src/features/planner/components/onboarding/OnboardingModal.tsx
'use client';

import React from 'react';
import OnboardingCarousel from '@/features/planner/components/onboarding/OnboardingCarousel';
import { useOnboardingContext } from '@/features/planner/hooks/onboarding/OnboardingContext';
import { Button } from '@/shared/ui/button';
import { Modal, ModalClose, ModalContent } from '@/shared/ui/modal';

export default function OnboardingModal() {
  const { showOnboarding: open, setShowOnboarding } = useOnboardingContext();
  const onClose = () => setShowOnboarding(false);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) onClose();
  };

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent
        aria-labelledby="onboarding-carousel-title"
        className="bg-background focus-visible:ring-primary relative max-w-sm border-none p-4 shadow-xl"
      >
        {/* Heading */}
        <h2 id="onboarding-carousel-title" className="sr-only">
          Welcome
        </h2>
        {/* Close button */}
        <div className="flex items-center justify-end pb-4">
          <ModalClose asChild>
            <Button type="button" variant="outline" size="icon" title="Close" icon="x" />
          </ModalClose>
        </div>
        {/* Carousel */}
        <div className="flex items-center justify-center">
          <OnboardingCarousel baseWidth={384} onFinish={onClose} />
        </div>
      </ModalContent>
    </Modal>
  );
}
