import Link from 'next/link';

export function LogoLink() {
  return (
    <Link
      href="/"
      className="text-foreground inline-flex items-center gap-2 justify-self-start rounded-lg p-2 text-lg font-semibold tracking-tight md:text-xl"
    >
      <span className="after:bg-primary/70 relative inline-flex items-center after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:rounded-lg">
        Turistar
      </span>
    </Link>
  );
}
