// src/features/home/components/FinalCta.tsx
'use client';

import { useState } from 'react';
import PlanForm from './PlanForm';
import { Button } from '@/shared/ui/button';
import { Modal, ModalClose, ModalContent, ModalTrigger } from '@/shared/ui/modal';

export default function FinalCta() {
  const [open, setOpen] = useState(false);
  const modalTitleId = 'final-cta-plan-modal-title';

  return (
    <section className="bg-card w-full py-16">
      <div className="mx-auto w-full px-6 text-center md:w-[60%]">
        <h2 className="mb-6 text-3xl font-semibold tracking-tight">Start using Turistar today</h2>
        <Modal open={open} onOpenChange={setOpen}>
          <ModalTrigger asChild>
            <Button>Start Your Planning</Button>
          </ModalTrigger>

          <ModalContent aria-labelledby={modalTitleId} className="w-full max-w-md border-none">
            <h2 id={modalTitleId} className="sr-only">
              Start planning your trip
            </h2>
            <div className="flex w-full justify-end">
              <ModalClose asChild>
                <Button type="button" variant="outline" size="icon" title="Close" icon="x" />
              </ModalClose>
            </div>
            <PlanForm />
          </ModalContent>
        </Modal>
      </div>
    </section>
  );
}
