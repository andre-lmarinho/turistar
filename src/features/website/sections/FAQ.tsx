import { Section, Container } from '@/features/website/ui/wrapper';
import { H2, P, Eyebrow } from '@/features/website/ui/typography';
import { CTAButton } from '@/features/website/ui/button';
import { CircleQuestionMark } from '@/shared/ui/icon';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqProps {
  items: FaqItem[];
}

export function Faq({ items }: FaqProps) {
  return (
    <Section>
      <Container>
        <Eyebrow>
          <CircleQuestionMark className="size-4" aria-hidden="true" />
          FAQ
        </Eyebrow>
        <H2>Frequently asked questions</H2>
        <P> These are some of our most frequently asked questions.</P>
        <CTAButton />
      </Container>
      <dl className="mt-12 space-y-6">
        {items.map((item, index) => (
          <div
            key={item.question + index}
            className="bg-muted/40 border-border rounded-2xl border p-6 text-left shadow-sm"
          >
            <dt className="text-foreground text-lg leading-[1.3] font-bold">{item.question}</dt>
            <dd className="text-muted-foreground mt-3 text-base leading-relaxed">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
