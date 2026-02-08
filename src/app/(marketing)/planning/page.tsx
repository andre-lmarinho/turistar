import Link from "next/link";
import { CtaFinal } from "@/features/website/sections/CTAFinal";
import { HeroPlanning } from "@/features/website/sections/Hero/Planning";
import { Eyebrow, H2, P } from "@/features/website/ui/typography";
import { Container, Section } from "@/features/website/ui/wrapper";
import { Calendar, Hotel, Laptop, type LucideIcon, Map as MapIcon, Mountain, Users } from "@/shared/ui/icon";

type PlanningGuide = {
  href: string;
  label: string;
  description: string;
  Icon: LucideIcon;
};

const PLANNING_GUIDES: PlanningGuide[] = [
  {
    href: "/planning/adventure",
    label: "Adventure",
    description: "Plan flexible routes for trails, checkpoints, and multi-stop expeditions.",
    Icon: Mountain,
  },
  {
    href: "/planning/digital-nomad",
    label: "Digital Nomad",
    description: "Balance work blocks, housing, and local exploration in one timeline.",
    Icon: Laptop,
  },
  {
    href: "/planning/event-based",
    label: "Event-based",
    description: "Coordinate trips around fixed dates like weddings, conferences, and concerts.",
    Icon: Calendar,
  },
  {
    href: "/planning/road-trip",
    label: "Road Trip",
    description: "Build routes with lodging, fuel stops, and practical day-by-day pacing.",
    Icon: MapIcon,
  },
  {
    href: "/planning/vacation",
    label: "Vacation",
    description: "Create stress-free getaways with maps, activities, and budget tracking.",
    Icon: Hotel,
  },
  {
    href: "/planning/family",
    label: "Family",
    description: "Organize trips for kids and adults while keeping everyone aligned.",
    Icon: Users,
  },
];

export default function PlanningHubPage() {
  return (
    <>
      <HeroPlanning
        eyebrow="Planning hub"
        title="Pick the planning style that fits your trip"
        description="Turistar is free and open-source. Choose a travel scenario below and start with the right workflow."
      />

      <Section>
        <Container>
          <Eyebrow>
            <Users className="size-4" aria-hidden="true" />
            Planning guides
          </Eyebrow>
          <H2>Explore by trip type</H2>
          <P>Each guide is tailored to a real travel context so you can start faster with less friction.</P>
        </Container>

        <Container size="wide" className="gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PLANNING_GUIDES.map(({ href, label, description, Icon }) => (
            <Link
              key={href}
              href={href}
              className="bg-card hover:bg-muted/40 focus-visible:ring-primary/60 border-border flex h-full flex-col gap-3 rounded-xl border p-5 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none">
              <span className="text-foreground inline-flex items-center gap-2 text-base font-semibold">
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </span>
              <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            </Link>
          ))}
        </Container>
      </Section>

      <CtaFinal variant="planning" />
    </>
  );
}
