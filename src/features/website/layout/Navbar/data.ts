import type { ComponentType } from "react";

import {
  Briefcase,
  Calendar,
  Hotel,
  Laptop,
  Map as MapIcon,
  Mountain,
  Sparkles,
  User,
  Users,
} from "@/shared/ui/icon";

export type SolutionItem = {
  href: string;
  label: string;
  description?: string;
  icon: ComponentType<{ className?: string }>;
};

export type SolutionCategory = {
  title: string;
  items: SolutionItem[];
  showDescription?: boolean;
};

export type NavLink = { href: string; label: string };

export const SOLUTION_CATEGORIES: SolutionCategory[] = [
  {
    title: "By traveler type",
    showDescription: true,
    items: [
      {
        href: "/signup",
        label: "Individual",
        description: "Tailored solo trip guidance.",
        icon: User,
      },
      {
        href: "/friends",
        label: "Friends",
        description: "Keep every friend on-plan.",
        icon: Users,
      },
      {
        href: "/agency",
        label: "Agency",
        description: "Organize client trips easily.",
        icon: Briefcase,
      },
    ],
  },
  {
    title: "By travel goal",
    items: [
      { href: "/planning/adventure", label: "Adventure", icon: Mountain },
      { href: "/planning/digital-nomad", label: "Nomad", icon: Laptop },
      { href: "/planning/event-based", label: "Event", icon: Calendar },
      { href: "/planning/road-trip", label: "Road trip", icon: MapIcon },
      { href: "/planning/vacation", label: "Vacation", icon: Hotel },
      { href: "/planning/group", label: "Group", icon: Users },
    ],
  },
];

export const NAV_LINKS: NavLink[] = [
  { href: "/agency", label: "Agencies" },
  { href: "/pricing", label: "Pricing" },
];

export const SOLUTIONS_CALLOUT = {
  href: "/inspiration/rome",
  eyebrow: "Try it now!",
  title: "Explore Rome",
  description: "Explore Rome like a local with ready-to-book activities.",
  icon: Sparkles,
};
