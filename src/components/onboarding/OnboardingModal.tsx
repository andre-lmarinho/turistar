// src/components/OnboardingModal.tsx
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
      <div className="backdrop-overlay" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="onboarding-carousel-title"
          className="relative bg-background rounded-lg shadow-xl w-[95%] max-w-md p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 id="onboarding-carousel-title" className="sr-only">
            Welcome
          </h2>
          <div className="absolute top-2 right-2">
            <CloseButton onClick={onClose} />
          </div>
          <OnboardingCarousel autoplay loop pauseOnHover baseWidth={320} />
        </div>
      </div>
    </>,
    document.body
  );
}
