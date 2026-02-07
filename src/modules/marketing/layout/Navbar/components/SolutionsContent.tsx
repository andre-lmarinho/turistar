import Link from "next/link";
import { Eyebrow } from "@/features/website/ui/typography";
import type { SolutionItem } from "../data";
import { EXPLORE_ITEMS, SOLUTIONS_CALLOUT } from "../data";

export function SolutionsContent({ onSelect }: { onSelect?: () => void }) {
  return (
    <div className="grid gap-3 md:grid-cols-[1.4fr_1fr] lg:border-border/70 lg:bg-popover lg:rounded-2xl lg:border p-2 lg:p-3 lg:shadow-[0_24px_60px_-25px_rgba(15,23,42,0.45)]">
      <ul className="grid grid-cols-2 gap-1">
        {EXPLORE_ITEMS.map((item) => (
          <li key={item.href} className="min-w-0">
            <SolutionLink item={item} onSelect={onSelect} />
          </li>
        ))}
      </ul>

      <SolutionsCallout />
    </div>
  );
}

type SolutionLinkProps = {
  item: SolutionItem;
  onSelect?: () => void;
};

function SolutionLink({ item, onSelect }: SolutionLinkProps) {
  return (
    <Link
      href={item.href}
      className="hover:bg-muted/60 group hover:border-border/60 flex h-full items-center gap-2.5 rounded-xl border border-transparent p-2.5 transition-all duration-200 hover:shadow-sm"
      onClick={onSelect}>
      <span className="bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors">
        <item.icon className="size-4" aria-hidden="true" />
      </span>
      <span className="text-foreground text-sm leading-5 font-semibold">{item.label}</span>
    </Link>
  );
}

function SolutionsCallout() {
  const Icon = SOLUTIONS_CALLOUT.icon;

  return (
    <Link
      href={SOLUTIONS_CALLOUT.href}
      aria-label={SOLUTIONS_CALLOUT.title}
      className="group text-foreground focus-visible:ring-primary/60 border-primary/30 from-primary/10 via-primary/15 to-primary/5 grid h-full grid-rows-[auto_1fr_auto] rounded-xl border bg-linear-to-br p-4 text-center transition-[background-color,box-shadow,transform] duration-200 ease-out hover:shadow-sm focus-visible:ring-2 focus-visible:outline-none active:scale-[0.995]">
      <Eyebrow className="justify-self-center">
        <Icon className="size-4" aria-hidden="true" />
        {SOLUTIONS_CALLOUT.eyebrow}
      </Eyebrow>

      <h3 className="self-center text-2xl leading-tight font-semibold">{SOLUTIONS_CALLOUT.title}</h3>
      <p className="mt-0 self-end text-xs leading-5">{SOLUTIONS_CALLOUT.description}</p>
    </Link>
  );
}
