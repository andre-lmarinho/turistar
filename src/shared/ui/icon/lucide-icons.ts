// src/shared/ui/icon/lucide-icons.ts
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeftRight,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Palette,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react';

import type { LucideIconName } from './icon-names';

export const lucideIcons = {
  'arrow-left-right': ArrowLeftRight,
  calendar: Calendar,
  check: Check,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  palette: Palette,
  pencil: Pencil,
  plus: Plus,
  'trash-2': Trash2,
  x: X,
} as const satisfies Record<LucideIconName, LucideIcon>;
