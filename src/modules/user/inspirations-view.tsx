import { getAllInspirationItems } from "@/features/inspirations/data";
import { Card } from "@/shared/ui/card/Card";
import { CardGrid } from "@/shared/ui/card/CardGrid";

export function InspirationsView() {
  const items = getAllInspirationItems();

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xl leading-none">🌍</span>
        <h2 className="text-foreground text-base font-semibold">Be inspired by fellow travelers</h2>
      </div>
      <CardGrid>
        {items.map((item) => (
          <Card key={item.slug} href={`/p/inspiration/${item.slug}`} title={item.title} image={item.image} />
        ))}
      </CardGrid>
    </section>
  );
}
