import { Section, Container } from '@/features/website/ui/wrapper';
import { H2, P, Eyebrow } from '@/features/website/ui/typography';
import { CTAButton } from '@/features/website/ui/button';
import { Users } from '@/shared/ui/icon';

const USE_CASES = [
  {
    title: 'Tours',
    description: 'Build multi day itineraries for different tour packages.',
  },
  {
    title: 'Groups',
    description: 'Organise group travel with clear schedules and budgets.',
  },
  {
    title: 'Incentives',
    description: 'Plan corporate incentive trips with transparent costs.',
  },
  {
    title: 'Packages',
    description: 'Create flexible packages that agents can reuse.',
  },
  {
    title: 'Custom',
    description: 'Tailor unique itineraries for special client needs.',
  },
  {
    title: 'Reports',
    description: 'Export cost breakdowns and schedules for presentations.',
  },
];

export function UseCases() {
  return (
    <Section>
      <Container>
        <Eyebrow>
          <Users className="size-4" aria-hidden="true" />
          Use cases
        </Eyebrow>
        <H2>Ways to work</H2>
        <P>See how Turistar fits different agency offerings and workflows.</P>
        <CTAButton />
      </Container>
      <Container size="wide" align="left" gap="3" className="md:grid-cols-2">
        {USE_CASES.map((useCase) => (
          <article
            key={useCase.title}
            className="bg-muted/40 border-border h-full rounded-xl border p-6 text-left transition-shadow hover:shadow-md"
          >
            <div className="flex flex-col gap-4">
              <h3 className="text-lg leading-[1.3] font-bold">{useCase.title}</h3>
              <p className="text-muted-foreground text-sm">{useCase.description}</p>
            </div>
          </article>
        ))}
      </Container>
    </Section>
  );
}
