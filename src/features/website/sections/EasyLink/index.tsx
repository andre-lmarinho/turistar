'use client';

import { useState } from 'react';
import Image from 'next/image';

import { Section, Container } from '@/features/website/ui/wrapper';
import { H2, P, Eyebrow } from '@/features/website/ui/typography';
import { CTAButton } from '@/features/website/ui/button';
import { ArrowLeftRight } from '@/shared/ui/icon';
import groupMock from '@/features/website/sections/Hero/media/group-mock.webp';

const YT_ID = 'xvFZjo5PgG0';

export function EasyLink() {
  const [play, setPlay] = useState(false);

  return (
    <Section>
      <Container>
        <Eyebrow>
          <ArrowLeftRight className="size-4" aria-hidden="true" />
          Easy link
        </Eyebrow>
        <H2>Share by link. Clone in one click.</H2>
        <P>Send a unique link to friends so they can view or clone your itinerary instantly.</P>
        <CTAButton />
      </Container>

      <Container>
        <div className="relative aspect-video w-full max-w-3xl overflow-hidden rounded-2xl">
          {!play ? (
            <button
              type="button"
              onClick={() => setPlay(true)}
              className="group relative block h-full w-full focus:outline-none"
              aria-label="Play video: Share by link"
            >
              <Image
                src={groupMock}
                alt="Preview of sharing trips by link"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 768px, 100vw"
                placeholder="blur"
                priority={false}
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-br from-black/25 to-black/50 transition-opacity group-hover:opacity-40"
              />
              <span
                aria-hidden
                className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 p-4 shadow-md transition group-hover:scale-105"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="28"
                  height="28"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </button>
          ) : (
            <iframe
              className="h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${YT_ID}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
              title="Easy link preview"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}
        </div>
      </Container>
    </Section>
  );
}
