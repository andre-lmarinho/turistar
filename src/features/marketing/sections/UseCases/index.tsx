export interface UseCaseItem {
  title: string;
  description: string;
}

export interface UseCasesProps {
  title: string;
  items: UseCaseItem[];
}

export default function UseCases({ title, items }: UseCasesProps) {
  return (
    <section>
      <h2>{title}</h2>
      <div>
        {items.map((item, index) => (
          <article key={item.title + index}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
