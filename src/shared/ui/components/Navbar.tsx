'use client';

import {
  useEffect,
  useState,
  type ComponentType,
  type FocusEvent,
  type KeyboardEvent,
} from 'react';
import Link from 'next/link';

import { Calendar, ChevronDown, Hotel, Laptop, Map, Mountain, User, Users } from '@/shared/ui/icon';
import { cn } from '@/shared/utils/cn';

type SolutionItem = {
  href: string;
  label: string;
  description?: string;
  icon: ComponentType<{ className?: string }>;
};

const travelerSolutions: SolutionItem[] = [
  {
    href: '/signup',
    label: 'Individual',
    description: 'Tailored solo trip guidance.',
    icon: User,
  },
  {
    href: '/friends',
    label: 'Friends',
    description: 'Keep every friend on-plan.',
    icon: Users,
  },
];

const travelGoalSolutions: SolutionItem[] = [
  {
    href: '/planning/adventure',
    label: 'Adventure',
    icon: Mountain,
  },
  {
    href: '/planning/digital-nomad',
    label: 'Nomad',
    icon: Laptop,
  },
  {
    href: '/planning/event-based',
    label: 'Event',
    icon: Calendar,
  },
  {
    href: '/planning/road-trips',
    label: 'Road trips',
    icon: Map,
  },
  {
    href: '/planning/vacations',
    label: 'Vacations',
    icon: Hotel,
  },
  {
    href: '/planning/group',
    label: 'Groups',
    icon: Users,
  },
];

export default function MarketingNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopSolutionsOpen, setIsDesktopSolutionsOpen] = useState(false);
  const [isMobileSolutionsOpen, setIsMobileSolutionsOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
    setIsMobileSolutionsOpen(false);
  };

  const handleDesktopMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      setIsDesktopSolutionsOpen(false);
    }
  };
  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
        setIsMobileSolutionsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="bg-background sticky top-0 z-50 justify-center px-4 lg:bg-transparent">
      <div className="bg-background mx-auto flex w-full max-w-6xl items-center justify-between gap-3 rounded-lg px-4 py-2 backdrop-blur md:gap-8 lg:m-2 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:border">
        <Link
          href="/"
          className="text-foreground inline-flex items-center gap-2 justify-self-start rounded-lg p-2 text-lg font-semibold tracking-tight md:text-xl"
        >
          <span className="after:bg-primary/70 relative inline-flex items-center after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:rounded-lg">
            Turistar
          </span>
        </Link>
        <nav className="relative hidden items-center justify-center lg:flex lg:justify-self-center">
          <div
            className="relative"
            onMouseEnter={() => setIsDesktopSolutionsOpen(true)}
            onMouseLeave={() => setIsDesktopSolutionsOpen(false)}
            onFocus={() => setIsDesktopSolutionsOpen(true)}
            onBlur={(event: FocusEvent<HTMLDivElement>) => {
              const nextFocused = event.relatedTarget as Node | null;
              if (!nextFocused || !event.currentTarget.contains(nextFocused)) {
                setIsDesktopSolutionsOpen(false);
              }
            }}
            onKeyDown={handleDesktopMenuKeyDown}
          >
            <button
              type="button"
              onClick={() => setIsDesktopSolutionsOpen((prev) => !prev)}
              onFocus={() => setIsDesktopSolutionsOpen(true)}
              className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/60 inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
              aria-expanded={isDesktopSolutionsOpen}
            >
              Solutions
              <ChevronDown
                aria-hidden="true"
                className={cn('size-4 origin-center transition-transform duration-200 ease-out', {
                  '-scale-y-100': isDesktopSolutionsOpen,
                })}
              />
            </button>
            <div
              className={cn(
                'pointer-events-none absolute top-full left-1/2 z-50 w-[min(56rem,calc(100vw-2rem))] -translate-x-1/2 pt-6 transition-opacity duration-150 ease-out',
                isDesktopSolutionsOpen ? 'pointer-events-auto opacity-100' : 'opacity-0'
              )}
            >
              <div
                className="pointer-events-none absolute top-2 left-0 h-4 w-full"
                aria-hidden="true"
              />
              <div className="border-border/70 bg-popover rounded-[32px] border p-5 shadow-[0_24px_60px_-25px_rgba(15,23,42,0.45)]">
                <div className="grid gap-3 md:[grid-template-columns:1fr_1.4fr_1fr]">
                  <div className="space-y-3">
                    <p className="text-muted-foreground text-sm font-semibold">By traveler type</p>
                    <ul className="space-y-2">
                      {travelerSolutions.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className="hover:bg-muted/60 group hover:border-border/60 flex items-center gap-3 rounded-2xl border border-transparent p-3 transition-all duration-200 hover:shadow-sm"
                          >
                            <span className="bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-lg transition-colors">
                              <item.icon className="size-6" aria-hidden="true" />
                            </span>
                            <span className="flex flex-col justify-center gap-[2px] text-[15px] leading-5">
                              <p className="text-foreground leading-5 font-semibold">
                                {item.label}
                              </p>
                              {item.description ? (
                                <p className="text-muted-foreground">{item.description}</p>
                              ) : null}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <p className="text-muted-foreground text-sm font-semibold">By travel goal</p>
                    <ul className="grid gap-2 md:grid-cols-2">
                      {travelGoalSolutions.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className="hover:bg-muted/60 group hover:border-border/60 flex items-center gap-3 rounded-2xl border border-transparent p-3 transition-all duration-200 hover:shadow-sm"
                          >
                            <span className="bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-lg transition-colors">
                              <item.icon className="size-6" aria-hidden="true" />
                            </span>
                            <span className="text-foreground flex flex-col justify-center text-[15px] leading-5 font-semibold">
                              {item.label}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="border-primary/30 from-primary/10 via-primary/15 to-primary/5 rounded-2xl border bg-gradient-to-br p-5">
                    <p className="text-primary text-sm font-semibold">Try a curated experience</p>
                    <p className="text-muted-foreground mt-1 text-xs leading-5">
                      Explore Rome like a local with ready-to-book activities and recommendations.
                    </p>
                    <Link
                      href="/inspiration/rome"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary/60 mt-4 inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
                    >
                      Explore the demo
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Link
            href="/pricing"
            className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/60 absolute top-1/2 left-full ml-6 -translate-y-1/2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            Pricing
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2 lg:ml-0 lg:justify-self-end">
          <Link
            href="/inspiration/rome"
            className="text-foreground hover:text-muted-foreground focus-visible:ring-primary/60 inline-flex h-10 items-center justify-center rounded-lg px-3 text-sm font-medium focus-visible:ring-2 focus-visible:outline-none"
          >
            Try a demo
          </Link>
          <Link
            href="/signup"
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary/60 inline-flex h-10 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            Get started
          </Link>
        </div>
        <button
          type="button"
          className="border-border/70 bg-background/90 hover:border-foreground/50 focus-visible:ring-primary/60 relative ml-2 flex h-12 w-12 items-center justify-center rounded-lg border transition-colors focus-visible:ring-2 focus-visible:outline-none lg:hidden"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={isMobileMenuOpen}
        >
          <span className="sr-only">Toggle navigation</span>
          <span
            className={cn(
              'bg-foreground absolute h-[2px] w-5 rounded-lg transition-transform duration-300 ease-in-out',
              isMobileMenuOpen ? 'translate-y-0 rotate-45' : '-translate-y-2'
            )}
          />
          <span
            className={cn(
              'bg-foreground absolute h-[2px] w-5 rounded-lg transition-opacity duration-200 ease-in-out',
              isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
            )}
          />
          <span
            className={cn(
              'bg-foreground absolute h-[2px] w-5 rounded-lg transition-transform duration-300 ease-in-out',
              isMobileMenuOpen ? 'translate-y-0 -rotate-45' : 'translate-y-2'
            )}
          />
        </button>
      </div>
      {isMobileMenuOpen && (
        <div className="border-border/60 bg-background fixed inset-x-0 top-full z-40 h-[calc(100dvh-4.5rem)] overflow-y-auto border-t pt-6 pb-10 shadow-[0_-8px_40px_-24px_rgba(15,23,42,0.65)]">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4">
            <div>
              <button
                type="button"
                className="text-foreground hover:text-primary flex w-full items-center justify-between py-3 text-left text-[15px] font-semibold transition-colors"
                onClick={() => setIsMobileSolutionsOpen((prev) => !prev)}
                aria-expanded={isMobileSolutionsOpen}
              >
                Solutions
                <ChevronDown
                  aria-hidden="true"
                  className={cn('size-5 origin-center transition-transform duration-200 ease-out', {
                    '-scale-y-100': isMobileSolutionsOpen,
                  })}
                />
              </button>
              {isMobileSolutionsOpen && (
                <div className="space-y-8">
                  <div className="space-y-3">
                    <p className="text-muted-foreground text-sm font-semibold">By traveler type</p>
                    <ul className="space-y-2.5">
                      {travelerSolutions.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className="group flex items-center gap-3 py-2"
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              setIsMobileSolutionsOpen(false);
                            }}
                          >
                            <span className="bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-lg transition-colors">
                              <item.icon className="size-6" aria-hidden="true" />
                            </span>
                            <span className="flex flex-col justify-center">
                              <p className="text-foreground text-[15px] leading-5 font-semibold">
                                {item.label}
                              </p>
                              {item.description ? (
                                <p className="text-muted-foreground text-xs leading-5">
                                  {item.description}
                                </p>
                              ) : null}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <p className="text-muted-foreground text-sm font-semibold">By travel goal</p>
                    <ul className="space-y-3">
                      {travelGoalSolutions.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className="group flex items-center gap-3 py-2"
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              setIsMobileSolutionsOpen(false);
                            }}
                          >
                            <span className="bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-lg transition-colors">
                              <item.icon className="size-6" aria-hidden="true" />
                            </span>
                            <span className="text-foreground text-[15px] leading-5 font-semibold">
                              {item.label}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    href="/inspiration/rome"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary/60 inline-flex w-full items-center justify-center rounded-lg px-4 py-3 text-[15px] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Explore the demo
                  </Link>
                </div>
              )}
            </div>
            <Link
              href="/pricing"
              className="text-foreground hover:text-primary text-[15px] font-semibold transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <div className="flex flex-col gap-3">
              <Link
                href="/inspiration/rome"
                className="text-foreground hover:text-muted-foreground focus-visible:ring-primary/60 inline-flex h-10 items-center justify-center rounded-lg px-3 text-sm font-medium focus-visible:ring-2 focus-visible:outline-none"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Try a demo
              </Link>
              <Link
                href="/signup"
                className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary/60 inline-flex h-12 items-center justify-center rounded-lg px-4 text-[15px] font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
