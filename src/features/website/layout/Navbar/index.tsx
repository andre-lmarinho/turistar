'use client';

import { useEffect, useRef, useState } from 'react';

import { DesktopActions } from './components/DesktopActions';
import { DesktopNavigation } from './components/DesktopNavigation';
import { MenuToggleButton } from './components/MenuToggleButton';
import { MobileMenu } from './components/MobileMenu';

import { Logo } from '@/shared/ui/Logo';

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
      <div
        ref={shellRef}
        data-elevated="false"
        className="data-[elevated=true]:bg-background data-[elevated=true]:lg:border-border mx-auto max-w-6xl rounded-2xl border border-transparent bg-transparent px-4 transition-[background-color,border-color] duration-300 ease-out lg:px-8 data-[elevated=true]:lg:border"
      >
        <div className="flex items-center justify-between gap-3 md:gap-8 lg:grid lg:grid-cols-[1fr_auto_1fr]">
          <Logo href="/" />
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
