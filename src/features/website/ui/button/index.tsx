import { Button } from '@/shared/ui/button';

export function CTAButton() {
  return <Button href="/signup">Get started</Button>;
}

export function CTAButtons() {
  return (
    <div className="flex flex-row items-center justify-start gap-3">
      <CTAButton />
      <Button href="/inspiration/rome" variant="ghost">
        Explore a demo
      </Button>
    </div>
  );
}
