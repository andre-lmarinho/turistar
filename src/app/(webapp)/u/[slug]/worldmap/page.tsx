import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Worldmap | Turistar App',
};

export default function UserWorldmapPage() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-background/60 p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-foreground">Worldmap</h1>
      <p className="text-sm text-muted-foreground">
        The global map grid is still under construction, but you will be able to explore routes,
        inspirations, and destinations soon.
      </p>
    </div>
  );
}
