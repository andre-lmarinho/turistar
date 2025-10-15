import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';

const containerVariants = cva('mx-auto grid w-full grid-cols-1 px-3', {
  variants: {
    size: {
      base: 'max-w-[50em]',
      wide: 'max-w-[70em]',
    },
    align: {
      center: 'place-items-center text-center',
      left: 'place-items-stretch text-left',
    },
    gap: {
      '3': 'gap-3',
      '4': 'gap-4',
      '8': 'gap-8',
      '16': 'gap-16',
    },
  },
  defaultVariants: { size: 'base', align: 'center', gap: '4' },
});

type Props = React.ComponentProps<'div'> & VariantProps<typeof containerVariants>;

export function Container({ size, align, gap, className, ...rest }: Props) {
  return <div className={cn(containerVariants({ size, align, gap }), className)} {...rest} />;
}
