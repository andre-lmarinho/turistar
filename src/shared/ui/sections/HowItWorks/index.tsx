import type { ReactNode } from 'react';

export interface HowItWorksStep {
  title: string;
  description: string;
  icon?: ReactNode;
}

export interface HowItWorksProps {
  title: string;
  subtitle?: string;
  steps: HowItWorksStep[];
}

export default function HowItWorks({ title, subtitle, steps }: HowItWorksProps) {
  return (
    <section>
      <header>
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </header>
      <ol>
        {steps.map((step, index) => (
          <li key={step.title + index}>
            {step.icon ? <span>{step.icon}</span> : null}
            <div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
