import { ArrowLeftRight } from '@/shared/ui/icon';
import MarketingSection from '@/features/website/ui/section/Wrapper';
import { Button } from '@/shared/ui/button';

export default function EasyLink() {
  return (
    <MarketingSection>
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="eyebrow">
          <ArrowLeftRight className="size-4" aria-hidden="true" />
          Easy link
        </p>
        <h2 className="text-[clamp(2rem,4vw,3rem)] leading-[1.1] font-bold text-balance">
          Share plans effortlessly
        </h2>
        <p className="text-muted-foreground max-w-2xl text-[clamp(1rem,2.2vw,1.125rem)] leading-[1.5] text-balance">
          Send a unique link to friends so they can view or clone your itinerary instantly.
        </p>
        <Button href="/signup">Get started</Button>
      </div>
      <div className="border-muted-foreground/40 bg-muted aspect-[4/3] w-full max-w-3xl overflow-hidden rounded-2xl border border-dashed">
        <div className="from-muted to-muted/40 text-muted-foreground flex h-full w-full items-center justify-center bg-gradient-to-br text-sm font-medium">
          Preview placeholder
        </div>
      </div>
    </MarketingSection>
  );
}
