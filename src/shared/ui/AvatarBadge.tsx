import { cn } from '@/shared/utils/cn';

type AvatarBadgeProps = {
  displayName: string | null;
  size?: 'sm' | 'lg';
};

export function AvatarBadge({ displayName, size = 'sm' }: AvatarBadgeProps) {
  const initial = displayName?.trim().charAt(0)?.toUpperCase() || 'T';
  const sizeClasses = size === 'lg' ? 'h-10 w-10 p-2 text-base' : 'h-6 w-6 p-1 text-xs';

  return (
    <div
      className={cn(
        'border-border bg-muted text-foreground inline-flex items-center justify-center rounded-full border font-semibold',
        sizeClasses
      )}
    >
      {initial}
    </div>
  );
}
