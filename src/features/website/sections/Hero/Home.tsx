import Image from "next/image";
import { Eyebrow, H1, P } from "@/features/website/ui/typography";
import { Container, Section } from "@/features/website/ui/wrapper";
import { Button } from "@/shared/ui/button";
import heroMock from "./media/hero-app-mock.webp";

export function HeroHome() {
  return (
    <Section variant="card">
      <Container size="wide" className="gap-16 lg:grid-cols-2">
        <div className="space-y-4">
          <Eyebrow>Turistar launches v1.2</Eyebrow>
          <H1>Less time planning. More time traveling.</H1>
          <P>
            A fully customizable planning webapp for individuals, businesses agencies and group of friends
            planning yours next trip, event or nomad adventure.
          </P>

          <Button className="w-full" href="/signup">
            Start Your Planning
          </Button>
        </div>

        <div className="mx-auto max-w-[min(1003px,100%)] justify-self-center lg:mx-0 lg:mr-[calc(50%-50vw-1.5rem)] lg:max-w-none lg:justify-self-auto">
          <div className="border-default bg-muted/30 block rounded-2xl border border-dashed p-1">
            <Image
              src={heroMock}
              alt=""
              className="block"
              aria-hidden="true"
              width={1003}
              height={522}
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}
