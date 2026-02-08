import type { ComponentType } from "react";

import { Calendar, Hotel, Laptop, Map as MapIcon, Mountain, Sparkles, Users } from "@/shared/ui/icon";

export type SolutionItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

export type NavLink = { href: string; label: string };

export const EXPLORE_ITEMS: SolutionItem[] = [
  { href: "/planning/adventure", label: "Adventure", icon: Mountain },
  { href: "/planning/digital-nomad", label: "Nomad", icon: Laptop },
  { href: "/planning/event-based", label: "Event", icon: Calendar },
  { href: "/planning/road-trip", label: "Road trip", icon: MapIcon },
  { href: "/planning/vacation", label: "Vacation", icon: Hotel },
  { href: "/planning/family", label: "Family", icon: Users },
];

export const NAV_LINKS: NavLink[] = [{ href: "/friends", label: "Friends" }];

export const SOLUTIONS_CALLOUT = {
  href: "/p/inspiration/rome",
  eyebrow: "Try it now!",
  title: "Open Rome Demo",
  description: "Explore Rome like a local with ready-to-book activities.",
  icon: Sparkles,
};
