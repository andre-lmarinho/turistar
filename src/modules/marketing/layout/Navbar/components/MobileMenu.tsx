import Link from "next/link";

import { ChevronDown } from "@/shared/ui/icon";
import { cn } from "@/shared/utils/cn";

import { NAV_LINKS } from "../data";
import { SolutionsContent } from "./SolutionsContent";

const MOBILE_MENU_LINK_CLASS =
  "text-foreground hover:text-primary flex w-full items-center justify-between text-left p-4 text-[15px] font-semibold transition-colors";

type MobileMenuProps = {
  onClose: () => void;
  isSolutionsOpen: boolean;
  onToggleSolutions: () => void;
  onSelectSolution: () => void;
};

export function MobileMenu({
  onClose,
  isSolutionsOpen,
  onToggleSolutions,
  onSelectSolution,
}: MobileMenuProps) {
  return (
    <nav
      aria-label="Mobile navigation"
      className="bg-background fixed inset-x-0 top-12 z-40 h-dvh overflow-y-auto pt-6 pb-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col">
        <button
          type="button"
          className={MOBILE_MENU_LINK_CLASS}
          onClick={onToggleSolutions}
          aria-expanded={isSolutionsOpen}>
          Explore
          <ChevronDown
            aria-hidden="true"
            className={cn("size-5 origin-center transition-transform duration-200 ease-out", {
              "-scale-y-100": isSolutionsOpen,
            })}
          />
        </button>

        {isSolutionsOpen ? <SolutionsContent onSelect={onSelectSolution} /> : null}

        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className={MOBILE_MENU_LINK_CLASS} onClick={onClose}>
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
