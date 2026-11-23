import Image from "next/image";
import Link from "next/link";

export function Logo({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-[0.55rem] text-[1.2rem] font-[750] tracking-[-0.045em] text-folio-ink no-underline focus-visible:outline-[3px] focus-visible:outline-folio-coral focus-visible:outline-offset-[3px]">
      <Image src="/favicon.svg" alt="" width={24} height={24} aria-hidden="true" />
      <span>Turistar</span>
    </Link>
  );
}
