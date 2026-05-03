import { CTAButton } from "@/features/website/ui/button";
import { Eyebrow, H2, P } from "@/features/website/ui/typography";
import { Container, Section } from "@/features/website/ui/wrapper";
import { Accordion } from "@/shared/ui/accordion";
import { CircleQuestionMark } from "@/shared/ui/icon";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqProps {
  items: FaqItem[];
}

export function Faq({ items }: FaqProps) {
  const accordionItems = items.map((item) => ({
    value: item.question,
    trigger: item.question,
    content: <P>{item.answer}</P>,
  }));

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
      <Accordion items={accordionItems} />
    </Section>
  );
}
