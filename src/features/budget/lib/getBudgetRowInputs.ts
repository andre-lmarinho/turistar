import type { CategoryKey } from "../types";

export type DescriptionConfig = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  ariaLabel?: string;
};

export type CategoryConfig = {
  id: string;
  value: CategoryKey;
  onChange: (value: CategoryKey) => void;
  ariaLabel?: string;
};

export type AmountConfig = {
  id: string;
  value: string;
  onValueChange: (value: number) => void;
  onBlur?: () => void;
  placeholder?: string;
  ariaLabel?: string;
};

export type BudgetRowInputsResult = {
  description: DescriptionConfig;
  category: CategoryConfig;
  amount: AmountConfig;
};

export function getBudgetRowInputs({
  description,
  category,
  amount,
}: BudgetRowInputsResult): BudgetRowInputsResult {
  return {
    description,
    category,
    amount,
  };
}
