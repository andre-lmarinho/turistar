import { CTAButton } from "@/features/website/ui/button";
import { Eyebrow, H2, P } from "@/features/website/ui/typography";
import { Container, Section } from "@/features/website/ui/wrapper";
import { Binoculars, CircleCheck } from "@/shared/ui/icon";

const FEATURE_ITEMS = [
  {
    title: "Date Picker",
    description: "Set start and end dates quickly to build a clear schedule.",
  },
  {
    title: "Destination Search",
    description: "Find attractions fast with autocomplete powered by Geoapify search.",
  },
  {
    title: "Sample Plans",
    description: "Browse sample trips for inspiration and duplicate ones you like.",
  },
  {
    title: "Responsive Design",
    description: "Use the planner comfortably on phones, tablets and desktops.",
  },
  {
    title: "Data Storage",
    description: "Every change is saved instantly, so your plans never disappear.",
  },
  {
    title: "Cloning Trips",
    description: "Copy itineraries from other travellers and make them your own.",
  },
];

export function Features() {
  return (
    <Section>
      <Container>
        <Eyebrow>
          <Binoculars className="size-4" aria-hidden="true" />
          Adicional features
        </Eyebrow>
        <H2>Extra planning tools</H2>
        <P>Enhance your trips with these helpful tools that streamline planning, mapping and budgeting.</P>
        <CTAButton />
      </Container>
      <Container size="wide" className="gap-3 md:grid-cols-3">
        {FEATURE_ITEMS.map((feature) => (
          <article
            key={feature.title}
            className="bg-muted/40 border-border h-full rounded-xl border p-6 text-left transition-shadow hover:shadow-md">
            <div className="flex flex-col">
              <h3 className="text-lg leading-[1.3] font-bold">
                <span className="text-foreground inline-flex items-center gap-2">
                  <CircleCheck className="size-4" aria-hidden="true" />
                  {feature.title}
                </span>
              </h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          </article>
        ))}
      </Container>
    </Section>
  );
}
