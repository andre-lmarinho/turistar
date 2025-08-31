// src/features/home/components/FinalCta.tsx
'use client';

import { useState } from 'react';
import PlanForm from './PlanForm';
import { Button, CloseButton, Modal } from '@/shared/ui';

export default function FinalCta() {
  const [open, setOpen] = useState(false);
  const openForm = () => setOpen(true);
  const closeForm = () => setOpen(false);

  return (
    <section className="bg-card w-full py-16">
      <div className="mx-auto w-full px-6 text-center md:w-[60%]">
        <h2 className="mb-6 text-3xl font-semibold tracking-tight">Start using Turistar today</h2>
        <Button onClick={openForm}>Start Your Planning</Button>
      </div>

      <Modal
        open={open}
        onClose={closeForm}
        overlayClassName="backdrop-overlay"
        wrapperClassName="fixed inset-0 z-50 flex items-center justify-center p-4 max-w-100 px-10 py-8 m-auto"
        className="w-full max-w-md p-6"
      >
        <div className="flex w-full justify-end">
          <CloseButton onClick={closeForm} />
        </div>
        <PlanForm />
      </Modal>
    </section>
  );
}
