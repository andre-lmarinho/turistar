import type { WorldMapMarker } from './WorldMapPanel';
import type { Database } from '@/shared/types/supabase';

type PlanRow = Database['public']['Tables']['plans']['Row'] & {
  is_public: boolean;
  public_slug: string;
  edit_token: string;
};

type DestinationRow = Database['public']['Tables']['destinations']['Row'];

type PlanDestinationRow = Database['public']['Tables']['plan_destinations']['Row'];

// Mirror the tables defined in docs/DB_SCHEMA.sql for the mock data.
const mockPlans: PlanRow[] = [
  {
    id: 'b1a7f079-3b5a-4d9d-9ba3-4ec6f0c7125e',
    user_id: '4b570b42-9a52-48c0-a271-3d5c8e8c66c5',
    title: 'Exploring Lisboa',
    start_date: '2024-05-01',
    end_date: '2024-05-07',
    created_at: '2024-03-15T10:00:00.000Z',
    budget: 1200,
    is_public: true,
    public_slug: 'lisbon-escape',
    edit_token: '8d6cda51-d5d3-4f9d-bc6b-3d1d5384a7f7',
  },
  {
    id: '326e5f9b-2d58-4a36-a59a-2c61d8f4d326',
    user_id: '4b570b42-9a52-48c0-a271-3d5c8e8c66c5',
    title: 'Tokyo Highlights',
    start_date: '2024-09-10',
    end_date: '2024-09-17',
    created_at: '2024-04-02T14:30:00.000Z',
    budget: 2500,
    is_public: true,
    public_slug: 'tokyo-highlights',
    edit_token: '32b9378a-2f93-4f0d-9a73-8b3f846a2f5d',
  },
];

const mockDestinations: DestinationRow[] = [
  {
    id: '05d1c766-693a-4ce6-8d6b-5a221f1db3e3',
    name: 'Lisbon',
    country: 'Portugal',
    latitude: 38.7223,
    longitude: -9.1393,
  },
  {
    id: '5f77a5df-0b09-49c6-a693-55e6a1e5c8a5',
    name: 'Tokyo',
    country: 'Japan',
    latitude: 35.6762,
    longitude: 139.6503,
  },
];

const mockPlanDestinations: PlanDestinationRow[] = [
  {
    plan_id: 'b1a7f079-3b5a-4d9d-9ba3-4ec6f0c7125e',
    destination_id: '05d1c766-693a-4ce6-8d6b-5a221f1db3e3',
    position: 0,
  },
  {
    plan_id: '326e5f9b-2d58-4a36-a59a-2c61d8f4d326',
    destination_id: '5f77a5df-0b09-49c6-a693-55e6a1e5c8a5',
    position: 0,
  },
];

// TODO: replace this mock with a real `getUserWorldMapMarkers` query once the backend is wired.
// Mock temporário criado para ' ser usado ' exclusivamente no /u/[slug]/worldmap.
export const worldMapMarkers: WorldMapMarker[] = mockPlanDestinations.reduce<WorldMapMarker[]>(
  (acc, planDestination) => {
    const plan = mockPlans.find((row) => row.id === planDestination.plan_id);
    const destination = mockDestinations.find((row) => row.id === planDestination.destination_id);

    if (!plan || !destination) {
      return acc;
    }

    if (destination.latitude == null || destination.longitude == null) {
      return acc;
    }

    acc.push({
      id: `${plan.id}-${destination.id}`,
      planId: plan.id,
      planTitle: plan.title ?? '',
      destination: destination.name,
      country: destination.country,
      lat: destination.latitude,
      lng: destination.longitude,
      updatedAt: plan.created_at ?? undefined,
    });

    return acc;
  },
  []
);
