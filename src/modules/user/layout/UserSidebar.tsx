"use client";

import { useParams, usePathname } from "next/navigation";

import { Button } from "@/shared/ui/button/Button";
import type { LucideIcon } from "@/shared/ui/icon";
import { Kanban, MapPin, Sparkles } from "@/shared/ui/icon";

const pageSections: { key: string; label: string; route: string; icon: LucideIcon }[] = [
  { key: "planners", label: "Planner", route: "planners", icon: Kanban },
  { key: "worldmap", label: "Worldmap", route: "worldmap", icon: MapPin },
  { key: "inspirations", label: "Inspirations", route: "inspirations", icon: Sparkles },
];

export function UserSidebar() {
  const pathname = usePathname() ?? "";
  const segment = pathname.split("/").filter(Boolean)[2] ?? "";
  const params = useParams();
  const slugParam = params?.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

  const navItems = slug
    ? pageSections.map((section) => ({
        ...section,
        href: `/u/${slug}/${section.route}`,
        isActive: segment === section.route,
      }))
    : [];

  return (
    <aside aria-label="User sidebar" className="w-64">
      <div className="flex flex-col gap-2 pb-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.key}
              href={item.href}
              variant={item.isActive ? undefined : "ghost"}
              className="w-full justify-start">
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </span>
            </Button>
          );
        })}
      </div>
    </aside>
  );
}
