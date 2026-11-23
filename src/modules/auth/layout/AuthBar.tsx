"use client";

import Link from "next/link";

import { LanguageSelect } from "@/modules/auth/components/LanguageSelect";
import { MapPin } from "@/ui/components/icon/lucide-icons";

export function AuthBar() {
  return (
    <header className="mx-auto flex w-full max-w-384 items-center justify-between border-b border-folio-ink/20 pb-4 max-folio-short:min-[34.01rem]:pb-[0.55rem]">
      <Link
        href="/"
        className="inline-flex items-center gap-[0.55rem] text-[1.2rem] font-[750] tracking-[-0.045em] text-folio-ink no-underline focus-visible:outline-[3px] focus-visible:outline-folio-coral focus-visible:outline-offset-[3px]">
        <MapPin aria-hidden="true" className="w-[1.15rem] text-folio-coral stroke-[2.3]" />
        <span>Turistar</span>
      </Link>
      <LanguageSelect className="relative z-50 flex flex-col items-end gap-2" />
    </header>
  );
}
