import { getPublicPlans } from "@/features/plan/lib/getPublicPlans";
import { Card } from "@/shared/ui/card/Card";
import { CardGrid } from "@/shared/ui/card/CardGrid";

export async function InspirationsView() {
  const plans = await getPublicPlans();

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xl leading-none">🌍</span>
        <h2 className="text-foreground text-base font-semibold">Be inspired by fellow travelers</h2>
      </div>
      <CardGrid>
        {plans.map((plan) => (
          <Card
            key={plan.id}
            href={`/p/${plan.publicSlug}`}
            title={plan.title}
            image={plan.coverImage ?? undefined}
          />
        ))}
      </CardGrid>
    </section>
  );
}
