// src/components/planner/onboarding/OnboardingModal.tsx
'use client';

import React, { useRef } from 'react';
import FocusTrap from 'focus-trap-react';
import ReactDOM from 'react-dom';
import { OnboardingCarousel, CloseButton } from '@/components';
import { useEscapeKey } from '@/hooks';
import { useOnboardingContext } from '@/contexts/OnboardingContext';

export default function OnboardingModal() {
  const { showOnboarding: open, setShowOnboarding } = useOnboardingContext();
  const onClose = () => setShowOnboarding(false);
  useEscapeKey({ onClose, isActive: open });

  const containerRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  return ReactDOM.createPortal(
    <>
      {/* Overlay */}
      <div className="backdrop-overlay" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Dialog */}
        <FocusTrap
          active={open}
          focusTrapOptions={{
            clickOutsideDeactivates: true,
            escapeDeactivates: false,
            initialFocus: false,
            fallbackFocus: () => containerRef.current ?? document.body,
            tabbableOptions: { displayCheck: 'none' },
          }}
        >
          <div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-carousel-title"
            tabIndex={-1}
            className="bg-background focus:ring-primary relative max-w-sm rounded-lg p-4 shadow-xl focus:ring-2 focus:outline-none"
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
        </FocusTrap>
      </div>
    </>,
    document.body
  );
}
