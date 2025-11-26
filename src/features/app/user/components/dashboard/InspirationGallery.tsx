import Link from 'next/link';

type InspirationCard = {
  slug: string;
  title: string;
  image?: string;
  tag?: string;
};

interface InspirationGalleryProps {
  items: InspirationCard[];
}

export function InspirationGallery({ items }: InspirationGalleryProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xl leading-none">🌍</span>
        <h2 className="text-foreground text-base font-semibold">
          Be inspired by fellow travellers
        </h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/p/inspiration/${item.slug}`}
            className="group border-border bg-card overflow-hidden rounded-xl border shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="relative h-32 w-full">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: item.image
                    ? `url(${item.image})`
                    : 'linear-gradient(135deg, #8b5cf6 0%, #22d3ee 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              {item.tag ? (
                <span className="bg-card/80 text-foreground absolute top-2 right-2 rounded-md px-2 py-1 text-xs font-semibold tracking-wide uppercase">
                  {item.tag}
                </span>
              ) : null}
            </div>
            <div className="px-3 py-2">
              <p className="text-sm font-semibold">{item.title}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
