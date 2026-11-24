import { Bus, FileText, Hotel, ShoppingCart, Ticket, Utensils } from "@/ui/components/icon";

export const CATEGORIES = [
  { key: "transport", label: "Transportation", translationKey: "categoryTransport", icon: Bus },
  { key: "lodging", label: "Lodging", translationKey: "categoryLodging", icon: Hotel },
  { key: "food", label: "Food", translationKey: "categoryFood", icon: Utensils },
  { key: "activities", label: "Tours & Activities", translationKey: "categoryActivities", icon: Ticket },
  { key: "shopping", label: "Shopping & Extras", translationKey: "categoryShopping", icon: ShoppingCart },
  { key: "documents", label: "Documents & Fees", translationKey: "categoryDocuments", icon: FileText },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]["key"];

export interface Entry {
  id: string;
  description: string;
  category: CategoryKey;
  amount: number;
}

export interface BudgetQueryResult {
  budget: number;
  entries: Entry[];
}
