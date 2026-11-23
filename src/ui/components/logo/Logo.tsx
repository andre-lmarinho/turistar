import Link from "next/link";

import { MapPin } from "@/ui/components/icon/lucide-icons";

export function Logo({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-[0.55rem] text-[1.2rem] font-[750] tracking-[-0.045em] text-folio-ink no-underline focus-visible:outline-[3px] focus-visible:outline-folio-coral focus-visible:outline-offset-[3px]">
      <MapPin aria-hidden="true" className="w-[1.15rem] text-folio-coral stroke-[2.3]" />
      <span>Turistar</span>
    </Link>
  );
}
