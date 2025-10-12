import Link from 'next/link';

import { ArrowLeftRight } from '@/shared/ui/icon';
import MarketingSection from '@/features/website/ui/section/Wrapper';

export default function EasyLink() {
  return (
    <MarketingSection innerClassName="flex flex-col items-center gap-12 text-center">
      <div className="flex flex-col items-center">
        <label className="text-primary bg-primary/10 pointer-events-none inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold tracking-wide select-none">
          <ArrowLeftRight className="size-4" aria-hidden="true" />
          Easy link
        </label>
        <h2 className="mt-4 text-[clamp(2rem,4vw,3rem)] leading-[1.1] font-bold text-balance">
          Share plans effortlessly
        </h2>
        <p className="text-muted-foreground mt-4 max-w-2xl text-[clamp(1rem,2.2vw,1.125rem)] leading-[1.5] text-balance">
          Send a unique link to friends so they can view or clone your itinerary instantly.
        </p>
        <Link
          href="/signup"
          className="bg-primary text-primary-foreground hover:bg-primary/90 mt-6 inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold transition-colors"
        >
          Get started
        </Link>
      </div>
      <div className="border-muted-foreground/40 bg-muted aspect-[4/3] w-full max-w-3xl overflow-hidden rounded-2xl border border-dashed">
        <div className="from-muted to-muted/40 text-muted-foreground flex h-full w-full items-center justify-center bg-gradient-to-br text-sm font-medium">
          Preview placeholder
        </div>
      </div>
    </MarketingSection>
  );
}
