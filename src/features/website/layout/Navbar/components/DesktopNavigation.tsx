import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import Link from "next/link";

import { ChevronDown } from "@/shared/ui/icon";

import { NAV_LINKS } from "../data";
import { SolutionsContent } from "./SolutionsContent";

export function DesktopNavigation() {
  return (
    <nav className="relative hidden items-center lg:flex lg:gap-6 lg:justify-self-center">
      <DesktopSolutionsMenu />
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/60 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none">
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

function DesktopSolutionsMenu() {
  return (
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
      <NavigationMenu.Viewport className="pointer-events-none absolute top-full left-1/2 z-50 h-(--radix-navigation-menu-viewport-height) w-(--radix-navigation-menu-viewport-width) -translate-x-1/2 transition-[opacity,transform,width,height] duration-150 ease-out data-[state=closed]:-translate-y-2 data-[state=closed]:opacity-0 data-[state=open]:pointer-events-auto data-[state=open]:translate-y-0 data-[state=open]:opacity-100" />
    </NavigationMenu.Root>
  );
}
