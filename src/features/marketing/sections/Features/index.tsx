import type { ReactNode } from 'react';

export interface FeatureItem {
  title: string;
  description: string;
  icon?: ReactNode;
}

export interface FeaturesProps {
  title: string;
  subtitle?: string;
  items: FeatureItem[];
}

export default function Features({ title, subtitle, items }: FeaturesProps) {
  return (
    <section>
      <header>
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </header>
      <div>
        {items.map((item, index) => (
          <article key={item.title + index}>
            {item.icon ? <span>{item.icon}</span> : null}
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
