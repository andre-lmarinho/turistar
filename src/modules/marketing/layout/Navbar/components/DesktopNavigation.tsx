import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import Link from "next/link";

import { ChevronDown } from "@/shared/ui/icon";

import { NAV_LINKS } from "../data";
import { SolutionsContent } from "./SolutionsContent";

export function DesktopNavigation() {
  return (
    <NavigationMenu.Root className="relative hidden lg:flex">
      <NavigationMenu.List className="flex list-none items-center gap-1 p-0">
        <NavigationMenu.Item>
          <NavigationMenu.Trigger className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/60 group inline-flex items-center gap-1 rounded-lg p-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none">
            Explore
            <ChevronDown
              aria-hidden="true"
              className="size-4 origin-center transition-transform duration-200 ease-out group-data-[state=open]:-scale-y-100"
            />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="w-[min(40rem,calc(100vw-2rem))]">
            <SolutionsContent />
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        {NAV_LINKS.map((link) => (
          <NavigationMenu.Item key={link.href}>
            <NavigationMenu.Link asChild>
              <Link
                href={link.href}
                className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/60 rounded-xl px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none">
                {link.label}
              </Link>
            </NavigationMenu.Link>
          </NavigationMenu.Item>
        ))}
      </NavigationMenu.List>

      <NavigationMenu.Viewport className="pointer-events-none absolute top-full left-0 z-50 h-(--radix-navigation-menu-viewport-height) w-(--radix-navigation-menu-viewport-width) transition-[opacity,transform,width,height] duration-150 ease-out data-[state=closed]:-translate-y-2 data-[state=closed]:opacity-0 data-[state=open]:pointer-events-auto data-[state=open]:translate-y-0 data-[state=open]:opacity-100" />
    </NavigationMenu.Root>
  );
}
