import * as Accordion from "@radix-ui/react-accordion";
import { CTAButton } from "@/features/website/ui/button";
import { Eyebrow, H2, P } from "@/features/website/ui/typography";
import { Container, Section } from "@/features/website/ui/wrapper";
import { CircleQuestionMark, Plus } from "@/shared/ui/icon";

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
        {items.map((item) => (
          <Accordion.Item key={item.question} value={item.question} className="overflow-hidden border-b">
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
