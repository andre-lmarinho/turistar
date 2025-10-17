import { Button } from '@/shared/ui/button';

export function DesktopActions() {
  return (
    <div className="ml-auto flex items-center gap-6 lg:ml-0 lg:justify-self-end">
      <Button href="/inspiration/rome" variant="ghost">
        Try a demo
      </Button>
      <Button href="/signup">Get started</Button>
    </div>
  );
}
