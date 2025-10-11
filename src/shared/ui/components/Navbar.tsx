'use client';

import { ChevronDown, Menu } from 'lucide-react';
import Link from 'next/link';

import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';

const solutionLinks = [
  {
    href: '/planning/vacations',
    label: 'Vacations & Getaways',
    description: 'Spark inspiration and align on dreamy escapes together.',
  },
  {
    href: '/planning/adventure',
    label: 'Adventure & Backpacking',
    description: 'Stay flexible offline with collaborative, mobile-friendly plans.',
  },
  {
    href: '/planning/road-trips',
    label: 'Road Trips',
    description: 'Design scenic routes, stops, and overnight stays with ease.',
  },
  {
    href: '/planning/event-based',
    label: 'Event-based Trips',
    description: 'Coordinate complex itineraries around weddings, festivals, and more.',
  },
  {
    href: '/planning/group',
    label: 'Group Getaways',
    description: 'Keep budgets, RSVPs, and shared decisions perfectly in sync.',
  },
  {
    href: '/planning/digital-nomad',
    label: 'Digital Nomad Trips',
    description: 'Blend remote work and leisure with timezone-aware scheduling.',
  },
];

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
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="text-muted-foreground hover:border-border hover:text-foreground flex size-10 items-center justify-center rounded-full border border-transparent transition-colors lg:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="size-5" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="border-border/60 w-64 p-0 lg:hidden">
              <div className="border-border/60 border-b">
                <div className="text-muted-foreground px-4 py-2 text-xs font-semibold tracking-wider uppercase">
                  Solutions
                </div>
                <ul>
                  {solutionLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:bg-muted/60 hover:text-foreground block px-4 py-3 text-sm font-medium transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <ul className="p-2">
                {marketingLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:bg-muted/60 hover:text-foreground flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>
          <nav
            aria-label="Marketing navigation"
            className="hidden items-center gap-1 lg:flex lg:gap-3 xl:gap-6"
          >
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="group text-muted-foreground hover:bg-muted/60 hover:text-foreground inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-medium transition-colors"
                >
                  <span>Solutions</span>
                  <ChevronDown className="ml-2 size-4 transition-transform group-data-[state=open]:rotate-180" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="border-border/60 w-[360px] p-0">
                <ul className="divide-border/60 divide-y">
                  {solutionLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="hover:bg-muted/60 focus-visible:bg-muted/60 block px-4 py-3 transition-colors"
                      >
                        <div className="text-foreground text-sm font-semibold">{link.label}</div>
                        <p className="text-muted-foreground mt-1 text-xs">{link.description}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </PopoverContent>
            </Popover>
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
