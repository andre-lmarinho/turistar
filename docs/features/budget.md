# Budget Feature

Tracks trip expenses and category totals.

```ts
import { BudgetPanelHeader } from '@/features/budget';
```

## Components

### BudgetPanelHeader
- **Location:** [`src/features/budget/components/BudgetPanelHeader.tsx`](../../src/features/budget/components/BudgetPanelHeader.tsx)
- **Responsibility:** Displays total budget and progress by category.
- **Props:** `{ totals: Record<string, number> }`
- **State:** `budgetInput`
- **External hooks:** `useBudgetContext`
- **Side-effects:** Updates budget totals when input loses focus
- **Accessibility:** Uses `role="region"` and labels for summary values
- **Interactions:** Users edit overall budget and view category progress bars
- **Performance notes:** none

### BudgetItem
- **Location:** [`src/features/budget/components/BudgetItem.tsx`](../../src/features/budget/components/BudgetItem.tsx)
- **Responsibility:** Shows or edits a single budget value.
- **Props:** `{ id: string; label: string; amount: number; editable?: boolean }`
- **State:** none
- **External hooks:** none
- **Side-effects:** none
- **Accessibility:** Grouped with label and numeric spinbutton semantics
- **Interactions:** Optional numeric input for editing
- **Performance notes:** none

### CategoryProgressBar
- **Location:** [`src/features/budget/components/CategoryProgressBar.tsx`](../../src/features/budget/components/CategoryProgressBar.tsx)
- **Responsibility:** Visual progress indicator for a category.
- **Props:** `{ amount: number; limit: number }`
- **State:** none
- **External hooks:** none
- **Side-effects:** none
- **Accessibility:** Announces percentage via `aria-valuenow`
- **Interactions:** none
- **Performance notes:** none

### ExpenseTable
- **Location:** [`src/features/budget/components/ExpenseTable.tsx`](../../src/features/budget/components/ExpenseTable.tsx)
- **Responsibility:** Editable table of expense entries.
- **Props:** `{ entries: BudgetEntry[]; onChange: (e: BudgetEntry[]) => void }`
- **State:** internal row state while editing
- **External hooks:** `useBudgetContext`
- **Side-effects:** Persists updated entries via context
- **Accessibility:** Table semantics with row and cell roles
- **Interactions:** Add, edit, and remove expense rows
- **Performance notes:** none

### BudgetRow
- **Location:** [`src/features/budget/components/BudgetRow.tsx`](../../src/features/budget/components/BudgetRow.tsx)
- **Responsibility:** Reusable table row for viewing, editing or creating an expense.
- **Props:** Mode-specific props such as `entry`, `onEdit`, `onSave`, or `onAdd`.
- **State:** Form inputs provided via props or context
- **External hooks:** `useBudgetContext`
- **Side-effects:** Invokes callbacks to modify budget entries
- **Accessibility:** Uses table row semantics with labeled inputs
- **Interactions:** View, edit, add and delete expense entries
- **Performance notes:** none

### ActivitiesBudgetPopup
- **Location:** [`src/features/budget/components/activities/ActivitiesBudget.tsx`](../../src/features/budget/components/activities/ActivitiesBudget.tsx)
- **Responsibility:** Batch-edit budget amounts for planner activities.
- **Props:** `{ open: boolean; onClose: () => void }`
- **State:** `inputs`, `shouldAutoFocus`
- **External hooks:** `useEscapeKey`
- **Side-effects:** Updates activities on close
- **Accessibility:** Modal dialog with labeled list items
- **Interactions:** Users edit multiple activity budgets in a popup
- **Performance notes:** none

## Hooks

### BudgetContext
- **Location:** [`src/features/budget/hooks/BudgetContext.tsx`](../../src/features/budget/hooks/BudgetContext.tsx)
- **Responsibility:** React context provider storing budget state and handlers.
- **Signature:** `BudgetProvider` wraps children and exposes context via `useBudgetContext()`
- **Inputs:** `{ planId: string; activitiesTotal: number }`
- **Outputs:** Budget state, totals, handlers to add/update/delete entries
- **Lifecycle:** Loads and persists budget data to Supabase
- **Exceptions:** none
- **Example:**
  ```tsx
  <BudgetProvider planId={planId} activitiesTotal={total}>
    ...
  </BudgetProvider>
  ```

### useBudgetSupabase
- **Location:** [`src/features/budget/hooks/useBudgetSupabase.ts`](../../src/features/budget/hooks/useBudgetSupabase.ts)
- **Responsibility:** Loads and persists budget data to Supabase.
- **Signature:** `useBudgetSupabase(planId: string, activitiesTotal: number)`
- **Inputs:** `planId`, initial activities total
- **Outputs:** Budget totals and mutation handlers
- **Lifecycle:** Fetches on mount and updates on change
- **Exceptions:** none
- **Example:**
  ```ts
  const { budget, setBudget } = useBudgetSupabase(id, total);
  ```

## Services

This feature uses Supabase via `useBudgetSupabase` and exposes no standalone service modules.

