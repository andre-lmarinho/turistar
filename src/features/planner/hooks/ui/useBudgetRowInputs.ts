import type { CategoryKey } from '@/features/planner/domain/constants/budget';

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
  onValueChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  ariaLabel?: string;
};

export type UseBudgetRowInputsArgs = {
  description: DescriptionConfig;
  category: CategoryConfig;
  amount: AmountConfig;
  amountCellClassName?: string;
};

export type UseBudgetRowInputsResult = {
  description: DescriptionConfig;
  category: CategoryConfig;
  amount: AmountConfig;
  amountCellClassName: string;
};

export function useBudgetRowInputs({
  description,
  category,
  amount,
  amountCellClassName = 'p-2 text-right',
}: UseBudgetRowInputsArgs): UseBudgetRowInputsResult {
  return {
    description,
    category,
    amount,
    amountCellClassName,
  };
}
