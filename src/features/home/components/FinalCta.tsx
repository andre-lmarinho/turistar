// src/features/home/components/FinalCta.tsx
'use client';

import { useState } from 'react';
import PlanForm from './PlanForm';
import { Button } from '@/shared/ui/button';
import { Modal, ModalContent } from '@/shared/ui/modal';

export default function FinalCta() {
  const [open, setOpen] = useState(false);
  const openForm = () => setOpen(true);
  const closeForm = () => setOpen(false);
  const modalTitleId = 'final-cta-plan-modal-title';

  return (
    <section className="bg-card w-full py-16">
      <div className="mx-auto w-full px-6 text-center md:w-[60%]">
        <h2 className="mb-6 text-3xl font-semibold tracking-tight">Start using Turistar today</h2>
        <Button onClick={openForm}>Start Your Planning</Button>
      </div>

      <Modal open={open} onOpenChange={(isOpen) => {
        if (!isOpen) closeForm();
      }}>
        <ModalContent
          aria-labelledby={modalTitleId}
          className="w-full max-w-md p-6"
          overlayProps={{ className: 'backdrop-overlay' }}
        >
        <h2 id={modalTitleId} className="sr-only">
          Start planning your trip
        </h2>
        <div className="flex w-full justify-end">
          <Button
            type="button"
            size="icon"
            title="Close"
            icon="x"
            onClick={closeForm}
          />
        </div>
        <PlanForm />
        </ModalContent>
      </Modal>
    </section>
  );
}
