import Link from 'next/link';
import type { UserPlannerSummary } from '@/server/queries/plans/getUserPlanners';

function gradientFor(plan: UserPlannerSummary, index: number) {
  const gradients = [
    'linear-gradient(135deg, #a855f7 0%, #22d3ee 100%)',
    'linear-gradient(135deg, #0ea5e9 0%, #1e293b 100%)',
    'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
    'linear-gradient(135deg, #14b8a6 0%, #0f172a 100%)',
  ];
  return gradients[index % gradients.length];
}

export function PlannerCard({ plan, index }: { plan: UserPlannerSummary; index: number }) {
  const bgImage = plan.destination
    ? `linear-gradient(135deg, rgba(0,0,0,0.55), rgba(0,0,0,0.4)), url(https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=60)`
    : gradientFor(plan, index);

  return (
    <Link
      href={`/p/${plan.publicSlug}`}
      className="group border-border bg-card overflow-hidden rounded-xl border shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative h-32 w-full">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: bgImage,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </div>
      <div className="px-3 py-2">
        <p className="truncate text-sm font-semibold">{plan.title}</p>
      </div>
    </Link>
  );
}
