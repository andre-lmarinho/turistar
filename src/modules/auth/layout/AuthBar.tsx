"use client";

import { LanguageSelect } from "@/modules/auth/components/LanguageSelect";
import { Logo } from "@/ui/components/logo";

export function AuthBar() {
  return (
    <header className="mx-auto flex w-full max-w-384 items-center justify-between border-b border-folio-ink/20 pb-4 max-folio-short:min-[34.01rem]:pb-[0.55rem]">
      <Logo href="/" />
      <LanguageSelect className="relative z-50 flex flex-col items-end gap-2" />
    </header>
  );
}
