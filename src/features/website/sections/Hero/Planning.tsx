import Image from "next/image";
import { CTAButtons } from "@/features/website/ui/button";
import { Eyebrow, H1, P } from "@/features/website/ui/typography";
import { Container, Section } from "@/features/website/ui/wrapper";
import heroMock from "./media/hero-app-mock.webp";

export interface HeroPlanningProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function HeroPlanning({ eyebrow, title, description }: HeroPlanningProps) {
  return (
    <Section variant="card">
      <Container size="wide" className="gap-16 lg:grid-cols-2">
        <div className="space-y-4">
          <Eyebrow>{eyebrow}</Eyebrow>
          <H1>{title}</H1>
          <P>{description}</P>
          <CTAButtons />
        </div>
        <div className="mx-auto max-w-[min(1003px,100%)] justify-self-center lg:mx-0 lg:mr-[calc(50%-50vw-1.5rem)] lg:max-w-none lg:justify-self-auto">
          <div className="border-default bg-muted/30 block rounded-2xl border border-dashed p-1">
            <Image src={heroMock} alt="" className="block" aria-hidden="true" width={1003} height={522} />
          </div>
        </div>
      </Container>
    </Section>
  );
}
