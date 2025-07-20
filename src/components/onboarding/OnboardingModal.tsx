// src/components/onboarding/OnboardingModal.tsx
'use client';

import React from 'react';
import ReactDOM from 'react-dom';
import { OnboardingCarousel, CloseButton } from '@/components';
import { useEscapeKey } from '@/hooks';

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
}

export default function OnboardingModal({ open, onClose }: OnboardingModalProps) {
  useEscapeKey({ onClose, isActive: open });

  if (!open) return null;

  return ReactDOM.createPortal(
    <>
      {/* Overlay */}
      <div className="backdrop-overlay" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Dialog */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="onboarding-carousel-title"
          className="relative bg-background rounded-lg shadow-xl max-w-sm p-4"
          onClick={(e) => e.stopPropagation()}
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
            <OnboardingCarousel autoplay pauseOnHover baseWidth={384} onFinish={onClose} />
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
