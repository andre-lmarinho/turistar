import MarketingSection from '@/shared/ui/sections/MarketingSection';

export interface FeatureBreakdownCategory {
  title: string;
  description?: string;
  items: string[];
}

export interface FeatureBreakdownProps {
  title: string;
  categories: FeatureBreakdownCategory[];
}

export default function FeatureBreakdown({ title, categories }: FeatureBreakdownProps) {
  return (
    <MarketingSection>
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
        {categories.map((category) => (
          <article
            key={category.title}
            className="bg-muted/40 border-border rounded-2xl border p-6 text-left shadow-sm"
          >
            <h3 className="text-xl font-semibold">{category.title}</h3>
            {category.description ? (
              <p className="text-muted-foreground mt-2 text-base">{category.description}</p>
            ) : null}
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
    </MarketingSection>
  );
}
