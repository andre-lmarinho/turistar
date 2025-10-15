'use client';

import { Eyebrow } from '@/features/website/ui/typography';
import { useEffect, useState, useRef, type ComponentType } from 'react';
import Link from 'next/link';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';

import {
  Calendar,
  ChevronDown,
  Hotel,
  Laptop,
  Map,
  Mountain,
  User,
  Users,
  Sparkles,
} from '@/shared/ui/icon';
import { ResumePlan } from './ResumePlan';
import { cn } from '@/shared/utils/cn';
import { Button } from '@/shared/ui/button';

type SolutionItem = {
  href: string;
  label: string;
  description?: string;
  icon: ComponentType<{ className?: string }>;
};
type SolutionCategory = {
  title: string;
  items: SolutionItem[];
  showDescription?: boolean;
};
type NavLink = { href: string; label: string };
const travelerSolutions: SolutionItem[] = [
  { href: '/signup', label: 'Individual', description: 'Tailored solo trip guidance.', icon: User },
  { href: '/friends', label: 'Friends', description: 'Keep every friend on-plan.', icon: Users },
  { href: '/agency', label: 'Agency', description: 'Organize client trips easily.', icon: Users },
];

const travelGoalSolutions: SolutionItem[] = [
  { href: '/planning/adventure', label: 'Adventure', icon: Mountain },
  { href: '/planning/digital-nomad', label: 'Nomad', icon: Laptop },
  { href: '/planning/event-based', label: 'Event', icon: Calendar },
  { href: '/planning/road-trips', label: 'Road trips', icon: Map },
  { href: '/planning/vacations', label: 'Vacations', icon: Hotel },
  { href: '/planning/group', label: 'Groups', icon: Users },
];

const solutionCategories: SolutionCategory[] = [
  { title: 'By traveler type', items: travelerSolutions, showDescription: true },
  { title: 'By travel goal', items: travelGoalSolutions },
];

const navLinks: NavLink[] = [
  { href: '/agency', label: 'Agencies' },
  { href: '/pricing', label: 'Pricing' },
];

const mobileMenuLinkClass =
  'text-foreground hover:text-primary flex w-full items-center justify-between text-left p-4 text-[15px] font-semibold transition-colors';

const LogoLink = () => (
  <Link
    href="/"
    className="text-foreground inline-flex items-center gap-2 justify-self-start rounded-lg p-2 text-lg font-semibold tracking-tight md:text-xl"
  >
    <span className="after:bg-primary/70 relative inline-flex items-center after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:rounded-lg">
      Turistar
    </span>
  </Link>
);

const NavLinkItem = ({ href, label }: NavLink) => (
  <Link
    href={href}
    className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/60 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
  >
    {label}
  </Link>
);

type SolutionLinkProps = {
  item: SolutionItem;
  showDescription?: boolean;
  onSelect?: () => void;
};
const SolutionLink = ({ item, showDescription, onSelect }: SolutionLinkProps) => {
  const hasDescription = Boolean(showDescription && item.description);
  return (
    <Link
      href={item.href}
      className="hover:bg-muted/60 group hover:border-border/60 flex h-min items-center gap-3 rounded-2xl border border-transparent p-3 transition-all duration-200 hover:shadow-sm"
      onClick={onSelect}
    >
      <span className="bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-lg transition-colors">
        <item.icon className="size-6" aria-hidden="true" />
      </span>
      <span>
        <h3 className="text-foreground leading-5 font-semibold">{item.label}</h3>
        {hasDescription ? (
          <p data-desc className="text-muted-foreground text-xs">
            {item.description}
          </p>
        ) : null}
      </span>
    </Link>
  );
};

type SolutionsCategoryProps = {
  category: SolutionCategory;
  onSelect?: () => void;
};
const SolutionsCategory = ({ category, onSelect }: SolutionsCategoryProps) => (
  <div className="pb-4">
    <p className="text-muted-foreground pl-4 text-sm font-semibold">{category.title}</p>
    <ul className="flex flex-wrap items-stretch gap-1">
      {category.items.map((item) => {
        return (
          <li
            key={item.href}
            className="min-w-0 flex-[0_0_calc(50%-0.125rem)] has-[p[data-desc]]:flex-[0_0_100%]"
          >
            <SolutionLink
              item={item}
              showDescription={category.showDescription}
              onSelect={onSelect}
            />
          </li>
        );
      })}
    </ul>
  </div>
);

const SolutionsCategories = ({ onSelect }: { onSelect?: () => void }) => (
  <>
    {solutionCategories.map((category) => (
      <SolutionsCategory key={category.title} category={category} onSelect={onSelect} />
    ))}
  </>
);

const SolutionsCallout = () => (
  <Link
    href="/inspiration/rome"
    aria-label="Explore Rome demo"
    className="group group text-foreground focus-visible:ring-primary/60 border-primary/30 from-primary/10 via-primary/15 to-primary/5 text-background m-2 block grid grid-rows-[auto_1fr_auto] rounded-2xl border bg-gradient-to-br p-5 text-center transition-[background-color,box-shadow,transform] duration-200 ease-out hover:shadow-sm focus-visible:ring-2 focus-visible:outline-none active:scale-[0.995]"
  >
    <Eyebrow className="self-start justify-self-end">
      <Sparkles className="size-4" aria-hidden="true" />
      Try it now!
    </Eyebrow>

    <h3 className="place-self-center text-3xl font-semibold">Explore Rome</h3>
    <p className="mt-0 self-end justify-self-start text-xs leading-5">
      Explore Rome like a local with ready-to-book activities.
    </p>
  </Link>
);

function SolutionsContent({
  onSelect,
  containerClassName,
  gridClassName,
}: {
  onSelect?: () => void;
  containerClassName?: string;
  gridClassName?: string;
}) {
  return (
    <div className={cn(containerClassName)}>
      <div className={cn('grid', gridClassName)}>
        <SolutionsCategories onSelect={onSelect} />
        <SolutionsCallout />
      </div>
    </div>
  );
}

const DesktopSolutionsMenu = () => (
  <NavigationMenu.Root className="relative">
    <NavigationMenu.List className="flex list-none items-center gap-6 p-0">
      <NavigationMenu.Item>
        <NavigationMenu.Trigger className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/60 group inline-flex items-center gap-1 rounded-lg p-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none">
          Solutions
          <ChevronDown
            aria-hidden="true"
            className="size-4 origin-center transition-transform duration-200 ease-out group-data-[state=open]:-scale-y-100"
          />
        </NavigationMenu.Trigger>
        <NavigationMenu.Content className="w-[min(56rem,calc(100vw-2rem))]">
          <SolutionsContent
            containerClassName="border-border/70 bg-popover rounded-[32px] border p-5 shadow-[0_24px_60px_-25px_rgba(15,23,42,0.45)]"
            gridClassName="gap-3 md:[grid-template-columns:1fr_1.4fr_1fr]"
          />
        </NavigationMenu.Content>
      </NavigationMenu.Item>
    </NavigationMenu.List>
    <NavigationMenu.Viewport className="pointer-events-none absolute top-full left-1/2 z-50 h-[var(--radix-navigation-menu-viewport-height)] w-[var(--radix-navigation-menu-viewport-width)] -translate-x-1/2 transition-[opacity,transform,width,height] duration-150 ease-out data-[state=closed]:-translate-y-2 data-[state=closed]:opacity-0 data-[state=open]:pointer-events-auto data-[state=open]:translate-y-0 data-[state=open]:opacity-100" />
  </NavigationMenu.Root>
);

const DesktopNavigation = () => (
  <nav className="relative hidden items-center lg:flex lg:gap-6 lg:justify-self-center">
    <DesktopSolutionsMenu />
    {navLinks.map((link) => (
      <NavLinkItem key={link.href} {...link} />
    ))}
  </nav>
);

const DesktopActions = () => (
  <div className="ml-auto flex items-center gap-6 lg:ml-0 lg:justify-self-end">
    <Button href="/inspiration/rome" variant="ghost">
      Try a demo
    </Button>
    <Button href="/signup">Get started</Button>
  </div>
);

type MenuToggleButtonProps = { isOpen: boolean; onToggle: () => void };
const MenuToggleButton = ({ isOpen, onToggle }: MenuToggleButtonProps) => (
  <button
    type="button"
    className="focus-visible:ring-primary/60 relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:outline-none lg:hidden"
    onClick={onToggle}
    aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
    aria-expanded={isOpen}
  >
    <span
      className={cn(
        'bg-foreground absolute h-[2px] w-5 rounded-lg transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-y-0 rotate-45' : '-translate-y-2'
      )}
    />
    <span
      className={cn(
        'bg-foreground absolute h-[2px] w-5 rounded-lg transition-opacity duration-200 ease-in-out',
        isOpen ? 'opacity-0' : 'opacity-100'
      )}
    />
    <span
      className={cn(
        'bg-foreground absolute h-[2px] w-5 rounded-lg transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-y-0 -rotate-45' : 'translate-y-2'
      )}
    />
  </button>
);

type MobileMenuProps = {
  onClose: () => void;
  isSolutionsOpen: boolean;
  onToggleSolutions: () => void;
  onSelectSolution: () => void;
};
const MobileMenu = ({
  onClose,
  isSolutionsOpen,
  onToggleSolutions,
  onSelectSolution,
}: MobileMenuProps) => (
  <div className="bg-background fixed inset-x-0 top-12 z-40 h-[calc(100dvh-4rem)] overflow-y-auto pt-6 pb-10">
    <div className="mx-auto flex w-full max-w-6xl flex-col">
      <button
        type="button"
        className={mobileMenuLinkClass}
        onClick={onToggleSolutions}
        aria-expanded={isSolutionsOpen}
      >
        Solutions
        <ChevronDown
          aria-hidden="true"
          className={cn('size-5 origin-center transition-transform duration-200 ease-out', {
            '-scale-y-100': isSolutionsOpen,
          })}
        />
      </button>

      {isSolutionsOpen ? (
        <SolutionsContent
          onSelect={onSelectSolution}
          gridClassName="gap-4 md:gap-3 md:[grid-template-columns:1fr_1.4fr_1fr]"
        />
      ) : null}

      {navLinks.map((link) => (
        <Link key={link.href} href={link.href} className={mobileMenuLinkClass} onClick={onClose}>
          {link.label}
        </Link>
      ))}
    </div>
  </div>
);

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSolutionsOpen, setIsMobileSolutionsOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
    setIsMobileSolutionsOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsMobileSolutionsOpen(false);
  };

  useEffect(() => {
    if (!isMobileMenuOpen) return;

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

  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = shellRef.current;

    if (!el) return;
    const getScrollY = () =>
      window.scrollY ?? document.documentElement.scrollTop ?? document.body.scrollTop ?? 0;
    const set = () => el.setAttribute('data-elevated', getScrollY() > 0 ? 'true' : 'false');
    set();
    window.addEventListener('scroll', set, { passive: true });
    return () => window.removeEventListener('scroll', set);
  }, []);

  return (
    <header
      className="bg-background fixed top-0 z-50 my-0 w-full px-6 py-2 lg:my-2 lg:mb-0 lg:bg-transparent lg:py-0"
      data-elevated="false"
    >
      <ResumePlan />
      <div
        ref={shellRef}
        data-elevated="false"
        className="data-[elevated=true]:bg-background data-[elevated=true]:lg:border-border mx-auto max-w-6xl rounded-2xl border border-transparent bg-transparent px-4 transition-[background-color,border-color] duration-300 ease-out lg:px-8 data-[elevated=true]:lg:border"
      >
        <div className="flex items-center justify-between gap-3 md:gap-8 lg:grid lg:grid-cols-[1fr_auto_1fr]">
          <LogoLink />
          <DesktopNavigation />
          <DesktopActions />
          <MenuToggleButton isOpen={isMobileMenuOpen} onToggle={toggleMobileMenu} />
        </div>
      </div>

      {isMobileMenuOpen ? (
        <MobileMenu
          onClose={closeMobileMenu}
          isSolutionsOpen={isMobileSolutionsOpen}
          onToggleSolutions={() => setIsMobileSolutionsOpen((prev) => !prev)}
          onSelectSolution={closeMobileMenu}
        />
      ) : null}
    </header>
  );
}
