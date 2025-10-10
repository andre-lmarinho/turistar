'use client';

import { useState } from 'react';

import PlanForm from './PlanForm';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog';

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

      <Dialog open={open} onClose={closeForm}>
        <DialogContent
          size="sm"
          className="w-full max-w-md p-6"
          aria-labelledby={dialogTitleId}
          aria-describedby={undefined}
        >
          <DialogHeader className="sr-only">
            <DialogTitle id={dialogTitleId}>Start planning your trip</DialogTitle>
          </DialogHeader>

          <div className="flex w-full justify-end">
            <DialogClose asChild>
              <Button
                type="button"
                variant="icon"
                size="icon"
                title="Close"
                icon="x"
                onClick={closeForm}
              />
            </DialogClose>
          </div>

          <PlanForm />
        </DialogContent>
      </Dialog>
    </section>
  );
}
