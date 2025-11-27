import { InspirationCard } from '@/features/app/inspiration/ui/InspirationCard';
import { getAllInspirationItems } from '@/features/app/inspiration/data';

export function InspirationGallery() {
  const items = getAllInspirationItems();

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xl leading-none">🌍</span>
        <h2 className="text-foreground text-base font-semibold">
          Be inspired by fellow travellers
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <InspirationCard key={item.slug} {...item} />
        ))}
      </div>
    </section>
  );
}
