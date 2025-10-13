import { Flame } from '@/shared/ui/icon';
import { Wrapper } from '@/features/website/ui/section/Wrapper';
import { Button } from '@/shared/ui/button';

export interface FeatureBreakdownCategory {
  title: string;
  description?: string;
  items: string[];
}

export interface FeatureBreakdownProps {
  categories: FeatureBreakdownCategory[];
}

export function PricingFeature({ categories }: FeatureBreakdownProps) {
  return (
    <Wrapper>
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
        <p className="eyebrow">
          <Flame className="size-4" aria-hidden="true" />
          Adicional features
        </p>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Feature breakdown</h2>
        <p className="text-muted-foreground max-w-2xl text-[clamp(1rem,2.2vw,1.125rem)] leading-[1.5] text-balance">
          Compare our Free and Agendy plans to see why we are the better choice.
        </p>
        <Button href="/signup">Get started</Button>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {categories.map((category) => (
          <article
            key={category.title}
            className="bg-muted/40 border-border rounded-2xl border p-6 text-left shadow-sm"
          >
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-semibold">{category.title}</h3>
              {category.description ? (
                <p className="text-muted-foreground text-base">{category.description}</p>
              ) : null}
            </div>
            <ul className="text-muted-foreground mt-4 space-y-2 text-sm">
              {category.items.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="bg-primary mt-1 h-1.5 w-1.5 rounded-full" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </Wrapper>
  );
}
