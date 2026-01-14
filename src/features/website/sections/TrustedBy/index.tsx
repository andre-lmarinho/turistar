"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Container, Section } from "@/features/website/ui/wrapper";

const BASE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function UlAvatarMarquee({
  speed = 900,
  gap = 36,
  size = 48,
  fade = 84,
}: {
  speed?: number;
  gap?: number;
  size?: number;
  fade?: number;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [times, setTimes] = useState(1);

  useEffect(() => {
    const calcTimes = () => {
      if (!wrapRef.current) return;
      const cw = Math.ceil(wrapRef.current.getBoundingClientRect().width);
      const perSet = BASE.length * (size + gap);
      const need = Math.max(1, Math.ceil((cw + gap) / perSet) + 1);
      setTimes(need);
    };
    calcTimes();
    const ro = new ResizeObserver(calcTimes);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [gap, size]);

  const A = useMemo(() => Array.from({ length: times }, () => BASE).flat(), [times]);
  const row = useMemo(() => [...A, ...A], [A]);
  const rowWithKeys = useMemo(() => {
    const counts = new Map<number, number>();
    return row.map((id) => {
      const count = counts.get(id) ?? 0;
      counts.set(id, count + 1);
      return { id, key: `${id}-${count}` };
    });
  }, [row]);
  const dist = A.length * (size + gap);
  const duration = dist / speed;
  const listStyle: CSSProperties = {
    gap: `${gap}px`,
    "--marquee-duration": `${duration || 1}s`,
    "--marquee-distance": `${-dist}px`,
  };

  return (
    <div
      ref={wrapRef}
      className="relative h-12 overflow-hidden"
      style={{
        WebkitMaskImage: `linear-gradient(to right, transparent, #000 ${fade}px, #000 calc(100% - ${fade}px), transparent)`,
        maskImage: `linear-gradient(to right, transparent, #000 ${fade}px, #000 calc(100% - ${fade}px), transparent)`,
      }}>
      <ul
        aria-label="People who (allegedly) trust Turistar"
        className="m-0 flex w-max list-none items-center p-0 will-change-transform"
        style={listStyle}>
        {rowWithKeys.map((item) => (
          <li key={item.key} className="flex-none">
            <Image
              src={`https://i.pravatar.cc/${size}?img=${item.id}`}
              alt=""
              aria-hidden="true"
              width={size}
              height={size}
              className="border-border block rounded-lg border"
              style={{ width: `${size}px`, height: `${size}px` }}
              draggable={false}
              loading="lazy"
              decoding="async"
            />
          </li>
        ))}
      </ul>

      <style jsx>{`
        @keyframes marquee {
          to {
            transform: translate3d(var(--marquee-distance, 0px), 0, 0);
          } /* move exatamente até o início da 2ª metade */
        }
        ul {
          animation: marquee var(--marquee-duration, 1s) linear infinite;
          transform: translate3d(0, 0, 0);
        }
        @media (prefers-reduced-motion: reduce) {
          ul {
            animation: none;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}

export function TrustedBy() {
  return (
    <Section variant="flush">
      <Container size="wide" className="md:grid-cols-[1fr_5fr]">
        <div className="flex items-center justify-center md:justify-start">
          <p className="text-center text-xs md:text-left">
            Trusted by mom, friends and suspiciously happy clients.
          </p>
        </div>
        <UlAvatarMarquee speed={90} gap={36} size={48} fade={84} />
      </Container>
    </Section>
  );
}
