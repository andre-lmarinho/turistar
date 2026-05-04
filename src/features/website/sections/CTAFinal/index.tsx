"use client";

import Image from "next/image";
import { H2 } from "@/features/website/ui/typography";
import { Container, Section } from "@/features/website/ui/wrapper";
import { Button } from "@/shared/ui/button";
import backgroundImage from "./media/background.webp";

export interface CtaFinalProps {
  variant?: "default" | "planning";
}

const TITLES: Record<"default" | "planning", string> = {
  default: "Start planning together",
  planning: "Plan your next adventure with Turistar now",
};

export function CtaFinal({ variant = "default" }: CtaFinalProps) {
  return (
    <Section variant="card">
      <Container className="gap-8">
        <H2 className="z-1">{TITLES[variant]}</H2>
        <Button href="/signup">Get started</Button>
        <Image
          src={backgroundImage}
          alt=""
          aria-hidden="true"
          role="presentation"
          fill
          sizes="(min-width: 1200px) 1048px, calc(100vw - 48px)"
          className="pointer-events-none object-cover select-none"
          draggable={false}
        />
      </Container>
    </Section>
  );
}
