'use client';

import PlanForm from './PlanForm';
import { Button } from '@/shared/ui/button';

export default function FinalCta() {
  const dialogTitleId = 'final-cta-plan-dialog-title';

  return (
    <section className="bg-card w-full py-16">
      <div className="mx-auto w-full px-6 text-center md:w-[60%]">
        <h2 className="mb-6 text-3xl font-semibold tracking-tight">Start using Turistar today</h2>
        <PlanForm
          trigger={<Button type="button">Start Your Planning</Button>}
          dialogTitleId={dialogTitleId}
        />
      </div>
    </section>
  );
}
