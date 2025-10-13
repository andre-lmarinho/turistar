import { UserStar } from '@/shared/ui/icon';
import { MarketingSection } from '@/features/website/ui/section/Wrapper';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqProps {
  title: string;
  items: FaqItem[];
}

export function Faq({ title, items }: FaqProps) {
  return (
    <MarketingSection>
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
        <p className="eyebrow">
          <UserStar className="size-4" aria-hidden="true" />
          FAQ
        </p>
        <h2 className="text-[clamp(2rem,4vw,3rem)] leading-[1.1] font-bold text-balance">
          {title}
        </h2>
      </div>
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
    </MarketingSection>
  );
}
