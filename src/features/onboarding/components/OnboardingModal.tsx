// src/components/planner/onboarding/OnboardingModal.tsx
'use client';

import React from 'react';
import { OnboardingCarousel, useOnboardingContext } from '@/features/onboarding';
import { CloseButton, Modal } from '@/shared/ui';
import { useEscapeKey } from '@/shared/hooks/ui/useEscapeKey';

export default function OnboardingModal() {
  const { showOnboarding: open, setShowOnboarding } = useOnboardingContext();
  const onClose = () => setShowOnboarding(false);
  useEscapeKey({ onClose, isActive: open });

  return (
    <Modal
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
        <CloseButton onClick={onClose} />
      </div>
      {/* Carousel */}
      <div className="flex items-center justify-center">
        <OnboardingCarousel baseWidth={384} onFinish={onClose} />
      </div>
    </Modal>
  );
}
