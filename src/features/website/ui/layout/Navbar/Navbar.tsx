'use client';

import {
  useEffect,
  useState,
  type ComponentType,
  type Dispatch,
  type FocusEvent,
  type KeyboardEvent,
  type SetStateAction,
} from 'react';
import Link from 'next/link';

import { Calendar, ChevronDown, Hotel, Laptop, Map, Mountain, User, Users } from '@/shared/ui/icon';
import ResumePlan from './ResumePlan';
import { cn } from '@/shared/utils/cn';

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
type ToggleHandler = Dispatch<SetStateAction<boolean>>;
type MenuKeyHandler = (event: KeyboardEvent<HTMLDivElement>) => void;

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
  {
    title: 'By traveler type',
    items: travelerSolutions,
    showDescription: true,
  },
  {
    title: 'By travel goal',
    items: travelGoalSolutions,
  },
];

const navLinks: NavLink[] = [
  { href: '/agency', label: 'Agencies' },
  { href: '/pricing', label: 'Pricing' },
];

const CTA_BASE = {
  ghost:
    'text-foreground hover:text-muted-foreground focus-visible:ring-primary/60 inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none',
  primary:
    'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary/60 inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none',
};

const CTA_SIZES = { md: 'h-10 px-3', lg: 'h-12 px-4 text-[15px]' };
const demoCallout = {
  title: 'Try a curated experience',
  description: 'Explore Rome like a local with ready-to-book activities and recommendations.',
  href: '/inspiration/rome',
  label: 'Explore the demo',
};
const mobileMenuLinkClass =
  'text-foreground hover:text-primary flex w-full items-center justify-between text-left  p-4 text-[15px] font-semibold transition-colors';

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

type CtaLinkProps = {
  href: string;
  label: string;
  variant: keyof typeof CTA_BASE;
  size?: keyof typeof CTA_SIZES;
  fullWidth?: boolean;
  className?: string;
  onClick?: () => void;
};
const CtaLink = ({
  href,
  label,
  variant,
  size = 'md',
  fullWidth,
  className,
  onClick,
}: CtaLinkProps) => (
  <Link
    href={href}
    onClick={onClick}
    className={cn(CTA_BASE[variant], CTA_SIZES[size], fullWidth && 'w-full', className)}
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
      <span className="bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary flex h-12 h-20 w-12 shrink-0 items-center justify-center rounded-lg transition-colors">
        <item.icon className="size-6" aria-hidden="true" />
      </span>
      <span>
        <p className="text-foreground leading-5 font-semibold">{item.label}</p>
        {hasDescription ? (
          <p className="text-muted-foreground text-xs">{item.description}</p>
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
    <ul className={'grid h-min grid-cols-2 gap-1'}>
      {category.items.map((item) => (
        <li key={item.href}>
          <SolutionLink
            item={item}
            showDescription={category.showDescription}
            onSelect={onSelect}
          />
        </li>
      ))}
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
  <div className="border-primary/30 from-primary/10 via-primary/15 to-primary/5 rounded-2xl border bg-gradient-to-br p-5">
    <p className="text-primary text-sm font-semibold">{demoCallout.title}</p>
    <p className="text-muted-foreground mt-1 text-xs leading-5">{demoCallout.description}</p>
    <CtaLink
      href={demoCallout.href}
      label={demoCallout.label}
      variant="primary"
      className="mt-4 w-full rounded-xl text-sm font-semibold"
    />
  </div>
);

type DesktopSolutionsMenuProps = {
  isOpen: boolean;
  onOpenChange: ToggleHandler;
  onKeyDown: MenuKeyHandler;
};
const DesktopSolutionsMenu = ({ isOpen, onOpenChange, onKeyDown }: DesktopSolutionsMenuProps) => {
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    const nextFocused = event.relatedTarget as Node | null;
    if (!nextFocused || !event.currentTarget.contains(nextFocused)) onOpenChange(false);
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => onOpenChange(true)}
      onMouseLeave={() => onOpenChange(false)}
      onFocus={() => onOpenChange(true)}
      onBlur={handleBlur}
      onKeyDown={onKeyDown}
    >
      <button
        type="button"
        onClick={() => onOpenChange((prev) => !prev)}
        onFocus={() => onOpenChange(true)}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/60 inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
        aria-expanded={isOpen}
      >
        Solutions
        <ChevronDown
          aria-hidden="true"
          className={cn('size-4 origin-center transition-transform duration-200 ease-out', {
            '-scale-y-100': isOpen,
          })}
        />
      </button>
      <div
        className={cn(
          'pointer-events-none absolute top-[4.5rem] left-1/2 z-50 w-[min(56rem,calc(100vw-2rem))] -translate-x-1/2 pt-6 transition-opacity duration-150 ease-out',
          isOpen ? 'pointer-events-auto opacity-100' : 'opacity-0'
        )}
      >
        <div className="pointer-events-none absolute top-2 left-0 h-4 w-full" aria-hidden="true" />
        <div className="border-border/70 bg-popover rounded-[32px] border p-5 shadow-[0_24px_60px_-25px_rgba(15,23,42,0.45)]">
          <div className="grid gap-3 md:[grid-template-columns:1fr_1.4fr_1fr]">
            <SolutionsCategories />
            <SolutionsCallout />
          </div>
        </div>
      </div>
    </div>
  );
};

type DesktopNavigationProps = {
  isSolutionsOpen: boolean;
  onSolutionsChange: ToggleHandler;
  onSolutionsKeyDown: MenuKeyHandler;
};
const DesktopNavigation = ({
  isSolutionsOpen,
  onSolutionsChange,
  onSolutionsKeyDown,
}: DesktopNavigationProps) => (
  <nav className="relative hidden items-center lg:flex lg:justify-self-center">
    <div className="flex items-center gap-6">
      <DesktopSolutionsMenu
        isOpen={isSolutionsOpen}
        onOpenChange={onSolutionsChange}
        onKeyDown={onSolutionsKeyDown}
      />
      {navLinks.map((link) => (
        <NavLinkItem key={link.href} {...link} />
      ))}
    </div>
  </nav>
);

const DesktopActions = () => (
  <div className="ml-auto flex items-center gap-2 lg:ml-0 lg:justify-self-end">
    <CtaLink href="/inspiration/rome" label="Try a demo" variant="ghost" />
    <CtaLink href="/signup" label="Get started" variant="primary" />
  </div>
);

type MenuToggleButtonProps = { isOpen: boolean; onToggle: () => void };
const MenuToggleButton = ({ isOpen, onToggle }: MenuToggleButtonProps) => (
  <button
    type="button"
    className="border-border/70 bg-background/90 hover:border-foreground/50 focus-visible:ring-primary/60 relative ml-2 flex h-12 w-12 items-center justify-center rounded-lg border transition-colors focus-visible:ring-2 focus-visible:outline-none lg:hidden"
    onClick={onToggle}
    aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
    aria-expanded={isOpen}
  >
    <span className="sr-only">Toggle navigation</span>
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
  <div className="bg-background fixed inset-x-0 top-[4.5rem] z-40 h-[calc(100dvh-4.5rem)] overflow-y-auto pt-6 pb-10">
    <div className="mx-auto flex w-full max-w-6xl flex-col">
      <button
        type="button"
        className={cn(mobileMenuLinkClass, 'justify-between')}
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
        <div>
          <SolutionsCategories onSelect={onSelectSolution} />
          <CtaLink
            href={demoCallout.href}
            label={demoCallout.label}
            variant="primary"
            fullWidth
            size="lg"
            className="font-semibold"
            onClick={onSelectSolution}
          />
        </div>
      ) : null}

      {navLinks.map((link) => (
        <Link key={link.href} href={link.href} className={mobileMenuLinkClass} onClick={onClose}>
          {link.label}
        </Link>
      ))}
    </div>
  </div>
);

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopSolutionsOpen, setIsDesktopSolutionsOpen] = useState(false);
  const [isMobileSolutionsOpen, setIsMobileSolutionsOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
    setIsMobileSolutionsOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsMobileSolutionsOpen(false);
  };

  const handleDesktopMenuKeyDown: MenuKeyHandler = (event) => {
    if (event.key === 'Escape') setIsDesktopSolutionsOpen(false);
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

  return (
    <header className="relative sticky top-2 z-50 mx-auto max-w-6xl justify-center px-4 lg:bg-transparent">
      <ResumePlan />
      <div className="bg-background mx-auto flex w-full justify-between gap-3 rounded-lg px-4 py-2 md:gap-8 lg:m-2 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:border">
        <LogoLink />
        <DesktopNavigation
          isSolutionsOpen={isDesktopSolutionsOpen}
          onSolutionsChange={setIsDesktopSolutionsOpen}
          onSolutionsKeyDown={handleDesktopMenuKeyDown}
        />
        <DesktopActions />
        <MenuToggleButton isOpen={isMobileMenuOpen} onToggle={toggleMobileMenu} />
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
