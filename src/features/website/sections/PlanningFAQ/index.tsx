import * as Accordion from '@radix-ui/react-accordion';

import { Section, Container } from '@/features/website/ui/wrapper';
import { H2, P, Eyebrow } from '@/features/website/ui/typography';
import { CTAButton } from '@/features/website/ui/button';
import { CircleQuestionMark, Plus } from '@/shared/ui/icon';

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
      <Accordion.Root type="single" collapsible className="space-y-4 text-left">
        {items.map((item, index) => (
          <Accordion.Item
            key={item.question + index}
            value={`faq-${index}`}
            className="overflow-hidden border-b"
          >
            <Accordion.Header>
              <Accordion.Trigger className="group text-foreground focus-visible:ring-primary/60 flex w-full items-center justify-between gap-4 py-4 text-left text-lg leading-[1.3] font-semibold transition-colors duration-300 ease-out focus-visible:ring-2 focus-visible:outline-hidden">
                <span className="flex-1">{item.question}</span>
                <Plus
                  className="size-5 shrink-0 transition-transform duration-300 ease-out group-data-[state=open]:rotate-45"
                  aria-hidden="true"
                />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="text-muted-foreground data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden transition-all duration-300 ease-out">
              <div className="pb-5">
                <P>{item.answer}</P>
              </div>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </Section>
  );
}
