import { InspirationCard } from '@/features/app/inspiration/ui/InspirationCard';
import { getAllInspirationItems } from '@/features/app/inspiration/data';
import { GalleryGrid } from '@/features/app/user/ui/GalleryGrid';

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
      <GalleryGrid>
        {items.map((item) => (
          <InspirationCard key={item.slug} {...item} />
        ))}
      </GalleryGrid>
    </section>
  );
}
