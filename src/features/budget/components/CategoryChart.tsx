import { useBudgetContext } from "../hooks/BudgetContext";
import { CATEGORIES } from "../types";
import { ProgressBar } from "../ui/ProgressBar";

export function CategoryChart() {
  const { totalSpent, categoryTotals } = useBudgetContext();

  const hasData = totalSpent > 0 && Object.keys(categoryTotals).length > 0;

  return (
    <section aria-labelledby="budget-categories-heading">
      <h2 id="budget-categories-heading" className="pt-4 pb-2 font-semibold">
        Categories
      </h2>

      {!hasData ? (
        <p className="text-sm text-muted-foreground">No spending data available</p>
      ) : (
        <div className="space-y-0">
          {CATEGORIES.map((category, idx) => {
            const value = categoryTotals[category.key] || 0;
            const percent = Math.min(100, (value / totalSpent) * 100);

            return (
              <ProgressBar
                key={category.key}
                category={category}
                value={value}
                percent={percent}
                colorIndex={idx}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
