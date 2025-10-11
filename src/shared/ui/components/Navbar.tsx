'use client';

import Link from 'next/link';

const marketingLinks = [
  { href: '/friends', label: 'Friends' },
  { href: '/pricing', label: 'Pricing' },
];

export default function MarketingNavbar() {
  return (
    <header className="border-border/70 bg-background/90 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 md:gap-8 md:py-5">
        <Link href="/" className="text-foreground text-lg font-semibold tracking-tight md:text-xl">
          Turistar
        </Link>
        <div className="flex flex-1 items-center justify-end gap-3">
          <nav
            aria-label="Marketing navigation"
            className="hidden items-center gap-1 lg:flex lg:gap-3 xl:gap-6"
          >
            {marketingLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:bg-muted/60 hover:text-foreground h-10 rounded-full px-4 text-sm font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/inspiration/rome"
              className="border-border bg-background text-foreground hover:bg-muted/60 inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition-colors"
            >
              Try a demo
            </Link>
            <Link
              href="/signup"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-medium transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
