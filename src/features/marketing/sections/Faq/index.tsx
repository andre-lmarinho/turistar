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
    <section>
      <h2>{title}</h2>
      <dl>
        {items.map((item, index) => (
          <div key={item.question + index}>
            <dt>{item.question}</dt>
            <dd>{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
