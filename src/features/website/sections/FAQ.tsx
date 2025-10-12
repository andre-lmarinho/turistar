import { UserStar } from '@/shared/ui/icon';
import MarketingSection from '@/features/website/ui/section/Wrapper';

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
        <label className="text-primary bg-primary/10 pointer-events-none inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold tracking-wide select-none">
          <UserStar className="size-4" aria-hidden="true" />
          FAQ
        </label>
        <h2 className="mt-4 text-[clamp(2rem,4vw,3rem)] leading-[1.1] font-bold text-balance">
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
