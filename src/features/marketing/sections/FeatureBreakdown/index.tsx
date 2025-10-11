export interface FeatureBreakdownCategory {
  title: string;
  description?: string;
  items: string[];
}

export interface FeatureBreakdownProps {
  title: string;
  categories: FeatureBreakdownCategory[];
}

export default function FeatureBreakdown({ title, categories }: FeatureBreakdownProps) {
  return (
    <section>
      <h2>{title}</h2>
      <div>
        {categories.map((category) => (
          <article key={category.title}>
            <h3>{category.title}</h3>
            {category.description ? <p>{category.description}</p> : null}
            <ul>
              {category.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
