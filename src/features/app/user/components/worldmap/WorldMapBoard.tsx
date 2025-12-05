'use client';

import { WorldMap } from './WorldMap';

export function WorldMapBoard() {
  return (
    <div className="bg-card relative w-full overflow-hidden rounded-xl border pb-12 lg:px-12">
      <WorldMap />
    </div>
  );
}
