import type { VisitedCountry } from '@/shared/types/worldMap';

import { WorldMap } from './WorldMap';

interface WorldMapBoardProps {
  visitedCountries: VisitedCountry[];
}

export function WorldMapBoard({ visitedCountries }: WorldMapBoardProps) {
  return (
    <div className="bg-card relative max-h-dvh w-full rounded-xl border p-4">
      <WorldMap visitedCountries={visitedCountries} />
    </div>
  );
}
