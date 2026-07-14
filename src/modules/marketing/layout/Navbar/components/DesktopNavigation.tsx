"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { ChevronDown } from "@/shared/ui/icon";
import { cn } from "@/shared/utils/cn";

import { NAV_LINKS } from "../data";
import { SolutionsContent } from "./SolutionsContent";

export function DesktopNavigation() {
  const [open, setOpen] = useState(false);
  const contentId = useId();
  const navRef = useRef<HTMLElement>(null);

  const closeMenu = () => setOpen(false);
  const openMenu = () => setOpen(true);
  const toggleMenu = () => setOpen((current) => !current);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && navRef.current?.contains(target)) return;

      setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <nav
      ref={navRef}
      aria-label="Main navigation"
      className="relative hidden lg:flex"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          closeMenu();
        }
      }}>
      <ul className="flex list-none items-center gap-1 p-0">
        <li onMouseEnter={openMenu} onMouseLeave={closeMenu}>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={contentId}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/60 group inline-flex cursor-pointer items-center gap-1 rounded-lg p-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
            onClick={toggleMenu}>
            Explore
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "size-4 origin-center transition-transform duration-200 ease-out",
                open ? "-scale-y-100" : undefined
              )}
            />
          </button>
          {open ? (
            <div id={contentId} className="absolute top-full left-0 z-50 w-[min(40rem,calc(100vw-2rem))]">
              <SolutionsContent onSelect={closeMenu} />
            </div>
          ) : null}
        </li>

        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/60 rounded-xl px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
