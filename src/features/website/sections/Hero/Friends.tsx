import Image from "next/image";
import { CTAButtons } from "@/features/website/ui/button";
import { Eyebrow, H1, P } from "@/features/website/ui/typography";
import { Container, Section } from "@/features/website/ui/wrapper";
import groupMock from "./media/group-mock.webp";

export function HeroFriends() {
  return (
    <Section variant="card">
      <Container>
        <Eyebrow>Plan with friends</Eyebrow>
        <H1>Keep every friend aligned on the itinerary</H1>
        <P>Shared boards, polls, and budgets bring clarity to every group conversation.</P>
        <CTAButtons />
        <div className="relative mt-6 -mb-[clamp(48px,5vw,96px)]">
          <Image
            src={groupMock}
            alt=""
            priority
            className="relative left-1/2 z-0 block h-auto w-[clamp(720px,90vw,1236px)] max-w-none -translate-x-1/2 select-none"
            width={1638}
            height={418}
            sizes="(min-width: 1236px) 1236px, 90vw"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-[63px] top-0 -bottom-[clamp(48px,5vw,96px)] z-10"
            style={{
              background:
                "radial-gradient(75% 50% at 51.1% 50%, rgba(229, 231, 235, 0) 48.984726914414416%, var(--card) 100%)",
            }}
          />
        </div>
      </Container>
    </Section>
  );
}
