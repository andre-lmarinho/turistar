import { ArrowLeftRight } from '@/shared/ui/icon';
import MarketingSection from '@/shared/ui/sections/MarketingSection';

export default function EasyLink() {
  return (
    <MarketingSection innerClassName="grid gap-12 lg:grid-cols-2 lg:items-center">
      <div className="order-2 lg:order-1">
        <label className="text-primary bg-primary/10 pointer-events-none inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold tracking-wide select-none">
          <ArrowLeftRight className="size-4" aria-hidden="true" />
          Easy link
        </label>
        <h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
          Share plans effortlessly
        </h2>
        <p className="text-muted-foreground mt-4 text-lg">
          Send a unique link to friends so they can view or clone your itinerary instantly.
        </p>
      </div>
      <div className="border-muted-foreground/40 bg-muted order-1 aspect-[4/3] overflow-hidden rounded-2xl border border-dashed lg:order-2">
        <div className="from-muted to-muted/40 text-muted-foreground flex h-full w-full items-center justify-center bg-gradient-to-br text-sm font-medium">
          Preview placeholder
        </div>
      </div>
    </MarketingSection>
  );
}
