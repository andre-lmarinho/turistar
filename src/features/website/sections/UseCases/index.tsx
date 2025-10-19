import type { ElementType } from 'react';

import { Section, Container } from '@/features/website/ui/wrapper';
import { H2, P, Eyebrow } from '@/features/website/ui/typography';
import { CTAButtons } from '@/features/website/ui/button';
import {
  Users,
  Briefcase,
  Map as MapIcon,
  Building2,
  Megaphone,
  BadgeCheck,
} from '@/shared/ui/icon';

type UseCase = {
  title: string;
  description: string;
  Icon: ElementType;
};

const USE_CASES: UseCase[] = [
  {
    title: 'Independent Agents',
    description:
      'Create proposals and itineraries in minutes with templates and drag-and-drop planning.',
    Icon: Briefcase,
  },
  {
    title: 'Tour Operators',
    description:
      'Standardize packages, documents, and deadlines with checklists and shared timelines.',
    Icon: MapIcon,
  },
  {
    title: 'Corporate',
    description: 'Apply policies and approvals, track budgets, and deliver on-demand trip reports.',
    Icon: Building2,
  },
  {
    title: 'Marketing',
    description: 'Share beautiful, branded proposals by link and capture leads that convert.',
    Icon: Megaphone,
  },
  {
    title: 'Customer Success',
    description: 'Delight clients with real-time updates, reminders, and centralized travel docs.',
    Icon: BadgeCheck,
  },
  {
    title: 'Groups & MICE',
    description:
      'Coordinate rooming lists, transfers, and tasks without spreadsheets or email chaos.',
    Icon: Users,
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
        <H2>Built for every agency</H2>
        <P>Empower every travel business with a single planning tool.</P>
        <CTAButtons />
      </Container>

      <Container size="wide" className="md:grid-cols-3 md:gap-16">
        {USE_CASES.map(({ title, description, Icon }) => (
          <ul key={title} className="h-full text-left">
            <li className="flex flex-col">
              <div className="mb-1 flex items-center gap-2">
                <Icon className="size-5" aria-hidden="true" />
                <h3 className="text-lg leading-[1.3] font-bold">{title}</h3>
              </div>
              <p className="text-muted-foreground text-sm">{description}</p>
            </li>
          </ul>
        ))}
      </Container>
    </Section>
  );
}
