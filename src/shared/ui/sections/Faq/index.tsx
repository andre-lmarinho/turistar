import MarketingSection from '@/shared/ui/sections/MarketingSection';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqProps {
  title: string;
  items: FaqItem[];
}

export default function Faq({ title, items }: FaqProps) {
  return (
    <MarketingSection>
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      </div>
      <dl className="mt-12 space-y-6">
        {items.map((item, index) => (
          <div
            key={item.question + index}
            className="bg-muted/40 border-border rounded-2xl border p-6 text-left shadow-sm"
          >
            <dt className="text-foreground text-lg font-semibold">{item.question}</dt>
            <dd className="text-muted-foreground mt-3 text-base leading-relaxed">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </MarketingSection>
  );
}
