import Link from 'next/link';

import { cn } from '@/shared/utils/cn';
import { Eyebrow } from '@/features/website/ui/typography';

import { SOLUTION_CATEGORIES, SOLUTIONS_CALLOUT, type SolutionItem } from '../data';

type SolutionsContentProps = {
  onSelect?: () => void;
  containerClassName?: string;
  gridClassName?: string;
};

export function SolutionsContent({
  onSelect,
  containerClassName,
  gridClassName,
}: SolutionsContentProps) {
  return (
    <div className={cn(containerClassName)}>
      <div className={cn('grid', gridClassName)}>
        {SOLUTION_CATEGORIES.map(({ title, items, showDescription }) => (
          <div key={title} className="pb-4">
            <p className="text-muted-foreground pl-4 text-sm font-semibold">{title}</p>
            <ul className="flex flex-wrap items-stretch gap-1">
              {items.map((item) => (
                <li
                  key={item.href}
                  className="min-w-0 flex-[0_0_calc(50%-0.125rem)] has-[p[data-desc]]:flex-[0_0_100%]"
                >
                  <SolutionLink item={item} showDescription={showDescription} onSelect={onSelect} />
                </li>
              ))}
            </ul>
          </div>
        ))}

        <SolutionsCallout />
      </div>
    </div>
  );
}

type SolutionLinkProps = {
  item: SolutionItem;
  showDescription?: boolean;
  onSelect?: () => void;
};

function SolutionLink({ item, showDescription, onSelect }: SolutionLinkProps) {
  const hasDescription = Boolean(showDescription && item.description);

  return (
    <Link
      href={item.href}
      className="hover:bg-muted/60 group hover:border-border/60 flex h-min items-center gap-3 rounded-2xl border border-transparent p-3 transition-all duration-200 hover:shadow-sm"
      onClick={onSelect}
    >
      <span className="bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-lg transition-colors">
        <item.icon className="size-6" aria-hidden="true" />
      </span>
      <span>
        <h3 className="text-foreground leading-5 font-semibold">{item.label}</h3>
        {hasDescription ? (
          <p data-desc className="text-muted-foreground text-xs">
            {item.description}
          </p>
        ) : null}
      </span>
    </Link>
  );
}

function SolutionsCallout() {
  const Icon = SOLUTIONS_CALLOUT.icon;

  return (
    <Link
      href={SOLUTIONS_CALLOUT.href}
      aria-label="Explore Rome demo"
      className="group group text-foreground focus-visible:ring-primary/60 border-primary/30 from-primary/10 via-primary/15 to-primary/5 m-2 block grid-rows-[auto_1fr_auto] rounded-2xl border bg-linear-to-br p-5 text-center transition-[background-color,box-shadow,transform] duration-200 ease-out hover:shadow-sm focus-visible:ring-2 focus-visible:outline-none active:scale-[0.995]"
    >
      <Eyebrow className="self-start justify-self-end">
        <Icon className="size-4" aria-hidden="true" />
        {SOLUTIONS_CALLOUT.eyebrow}
      </Eyebrow>

      <h3 className="place-self-center text-3xl font-semibold">{SOLUTIONS_CALLOUT.title}</h3>
      <p className="mt-0 self-end justify-self-start text-xs leading-5">
        {SOLUTIONS_CALLOUT.description}
      </p>
    </Link>
  );
}
