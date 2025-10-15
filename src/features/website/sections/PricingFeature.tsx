import { Section, Container } from '@/features/website/ui/wrapper';
import { H2, P, Eyebrow } from '@/features/website/ui/typography';
import { CTAButton } from '@/features/website/ui/button';
import { Flame } from '@/shared/ui/icon';

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
    <Section>
      <Container>
        <Eyebrow>
          <Flame className="size-4" aria-hidden="true" />
          Adicional features
        </Eyebrow>
        <H2>Feature breakdown</H2>
        <P>Compare our Free and Agendy plans to see why we are the better choice.</P>
        <CTAButton />
      </Container>
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
    </Section>
  );
}
