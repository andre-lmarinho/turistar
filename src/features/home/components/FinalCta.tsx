// src/features/home/components/FinalCta.tsx
'use client';

import { useState } from 'react';
import PlanForm from './PlanForm';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';

export default function FinalCta() {
  const [open, setOpen] = useState(false);
  const openForm = () => setOpen(true);
  const closeForm = () => setOpen(false);
  const dialogTitleId = 'final-cta-plan-dialog-title';

  return (
    <section className="bg-card w-full py-16">
      <div className="mx-auto w-full px-6 text-center md:w-[60%]">
        <h2 className="mb-6 text-3xl font-semibold tracking-tight">Start using Turistar today</h2>
        <Button onClick={openForm}>Start Your Planning</Button>
      </div>

      <Dialog
        open={open}
        onClose={closeForm}
        overlayClassName="backdrop-overlay"
        wrapperClassName="fixed inset-0 z-50 flex items-center justify-center p-4 max-w-100 px-10 py-8 m-auto"
        className="w-full max-w-md p-6"
        aria-labelledby={dialogTitleId}
      >
        <h2 id={dialogTitleId} className="sr-only">
          Start planning your trip
        </h2>
        <div className="flex w-full justify-end">
          <Button
            type="button"
            variant="icon"
            size="icon"
            title="Close"
            icon="x"
            onClick={closeForm}
          />
        </div>
        <PlanForm />
      </Dialog>
    </section>
  );
}
