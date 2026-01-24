import type { CATEGORIES } from "../types";
import { CHART_COLORS } from "../types";

export function ProgressBar({
  category,
  value,
  percent,
  colorIndex,
}: {
  category: (typeof CATEGORIES)[number];
  value: number;
  percent: number;
  colorIndex: number;
}) {
  const { key, label, icon: Icon } = category;

  return (
    <div key={key}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={12} aria-hidden="true" />
          <span className="text-sm">{label}</span>
        </div>
        <span className="text-sm font-mono">${value.toFixed(2)}</span>
      </div>

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
        aria-label={`${label} usage ${Math.round(percent)}%`}
        className="bg-muted mb-3 mt-1 h-2 rounded">
        <div
          className="h-2 rounded"
          style={{
            width: `${percent}%`,
            backgroundColor: CHART_COLORS[colorIndex % CHART_COLORS.length],
          }}
        />
      </div>
    </div>
  );
}
