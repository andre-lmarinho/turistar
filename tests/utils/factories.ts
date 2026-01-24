/**
 * Data factories for creating consistent test fixtures.
 * Use these to generate mock data for tests.
 */

export interface Activity {
  id: string;
  title: string;
  color: string;
  position: string;
  description: string;
  address: string;
  duration: number;
  day_id: string;
  category: string;
}

export interface DayPlan {
  id: string;
  label: string;
  position: string;
  activities: Activity[];
}

export interface BudgetEntry {
  id: string;
  plan_id: string;
  description: string;
  category: string;
  amount: number;
}

export interface Plan {
  id: string;
  public_slug: string;
  edit_token: string;
  title: string;
  user_id: string | null;
  budget: number | null;
  start_date: string | null;
  end_date: string | null;
  is_public: boolean;
  plan_destinations: { destinations: { name: string; country: string | null } }[] | null;
  plan_members: { user_id: string; tier: string }[] | null;
}

export interface Profile {
  id: string;
  slug: string;
  display_name: string;
  avatar_url: string | null;
}

export interface Snapshot {
  plan_id: string;
  version: number;
  state: { days: DayPlan[] };
  updated_at: string;
}

export interface GeoapifyResult {
  name: string;
  latitude: number;
  longitude: number;
  countryCode: string;
}

export function createActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: "activity-1",
    title: "Test Activity",
    color: "bg-blue-500",
    position: "a0",
    description: "",
    address: "",
    duration: 60,
    day_id: "2024-01-15",
    category: "general",
    ...overrides,
  };
}

export function createDayPlan(overrides: Partial<DayPlan> = {}): DayPlan {
  return {
    id: "2024-01-15",
    label: "Mon, 15 Jan",
    position: "a0",
    activities: [],
    ...overrides,
  };
}

export function createBudgetEntry(overrides: Partial<BudgetEntry> = {}): BudgetEntry {
  return {
    id: "budget-entry-1",
    plan_id: "plan-1",
    description: "Test Entry",
    category: "food",
    amount: 50,
    ...overrides,
  };
}

export function createPlan(overrides: Partial<Plan> = {}): Plan {
  return {
    id: "plan-1",
    public_slug: "plan-1",
    edit_token: "edit-token-1",
    title: "Test Plan",
    user_id: "user-1",
    budget: 1000,
    start_date: "2024-01-01",
    end_date: "2024-01-05",
    is_public: true,
    plan_destinations: [{ destinations: { name: "Paris", country: "FR" } }],
    plan_members: [],
    ...overrides,
  };
}

export function createProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: "user-1",
    slug: "user-1",
    display_name: "Test User",
    avatar_url: null,
    ...overrides,
  };
}

export function createSnapshot(overrides: Partial<Snapshot> = {}): Snapshot {
  return {
    plan_id: "plan-1",
    version: 0,
    state: { days: [] },
    updated_at: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

export function createGeoapifyResult(overrides: Partial<GeoapifyResult> = {}): GeoapifyResult {
  return {
    name: "Paris, France",
    latitude: 48.8566,
    longitude: 2.3522,
    countryCode: "FR",
    ...overrides,
  };
}

export function createActivities(count: number, base: Partial<Activity> = {}): Activity[] {
  return Array.from({ length: count }, (_, i) =>
    createActivity({ ...base, id: `activity-${i + 1}`, title: `Activity ${i + 1}` })
  );
}

export function createDayPlans(count: number, base: Partial<DayPlan> = {}): DayPlan[] {
  return Array.from({ length: count }, (_, i) =>
    createDayPlan({
      ...base,
      id: `day-${i + 1}`,
      label: `Day ${i + 1}`,
      position: `d${i}`,
    })
  );
}

export function createBudgetEntries(count: number, base: Partial<BudgetEntry> = {}): BudgetEntry[] {
  return Array.from({ length: count }, (_, i) =>
    createBudgetEntry({ ...base, id: `budget-entry-${i + 1}`, description: `Entry ${i + 1}` })
  );
}
