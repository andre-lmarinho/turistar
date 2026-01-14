import { CATEGORIES, type CategoryKey, CHART_COLORS } from "@/features/app/planner/domain/constants/budget";

interface Props {
  category: CategoryKey;
  value: number;
  total: number;
  colorIndex: number;
}

export function CategoryProgressBar({ category, value, total, colorIndex }: Props) {
  const match = CATEGORIES.find((c) => c.key === category);
  if (!match) {
    throw new Error(`CategoryProgressBar: missing category definition for key=${category}`);
  }
  const { label, icon } = match;
  const percent = total ? Math.min(100, (value / total) * 100) : 0;
  const Icon = icon;
  const formattedValue = value.toFixed(2);

  return (
    <>
      <div className="z-30 flex items-center justify-between">
        <div className="ml-1 flex items-center gap-2">
          <Icon size={12} aria-hidden="true" />
          <span className="text-sm">{label}</span>
        </div>
        <span className="sr-only">{`$${formattedValue} spent`}</span>
        <span className="mr-1 w-20 text-right text-sm" aria-hidden="true">
          {`$${formattedValue}`}
        </span>
      </div>

      {/* accessible progress bar */}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
        aria-label={`${label} usage ${Math.round(percent)}%`}
        className="bg-muted mb-3 flex-1 rounded">
        <div
          className="h-2 rounded"
          style={{ width: `${percent}%`, backgroundColor: CHART_COLORS[colorIndex] }}
        />
      </div>
    </>
  );
}
