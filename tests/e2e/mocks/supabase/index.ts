import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/types/supabase';
import planFixture from '../../fixtures/plan.json';

type PlanSnapshotRow = (typeof planFixture)['plan']['snapshots'][number];
type PlanEventRow = {
  event_id: string;
  plan_id: string;
  version: number;
  event_type: string;
  payload: unknown;
  created_at: string;
  actor_id: string | null;
};

type PlanState = {
  plan_id: string;
  public_slug: string;
  edit_token: string;
  title: string;
  snapshots: PlanSnapshotRow[];
  events: PlanEventRow[];
};

type EqFilters = Record<string, unknown>;
type GtFilters = Record<string, number>;

type OrderFilter = {
  column: string;
  ascending: boolean;
};

function clonePlan(): PlanState {
  return JSON.parse(JSON.stringify(planFixture.plan)) as PlanState;
}

class MockRealtimeChannel {
  on() {
    return this;
  }

  subscribe() {
    return this;
  }

  async unsubscribe() {
    return { error: null };
  }
}

type TableName = 'plan_snapshots' | 'plan_events';

class MockQueryBuilder<TTable extends TableName> {
  private eqFilters: EqFilters = {};
  private gtFilters: GtFilters = {};
  private orderFilter: OrderFilter | null = null;

  constructor(private table: TTable, private client: MockSupabaseClientImpl) {}

  select() {
    return this;
  }

  eq(column: string, value: unknown) {
    this.eqFilters[column] = value;
    return this;
  }

  gt(column: string, value: number) {
    this.gtFilters[column] = value;
    return this;
  }

  async order(column: string, options?: { ascending?: boolean }) {
    this.orderFilter = {
      column,
      ascending: options?.ascending ?? true,
    };
    const data = await this.execute();
    return data;
  }

  async maybeSingle() {
    const rows = await this.fetchRows();
    const [first] = rows;
    return { data: first ?? null, error: null };
  }

  private async execute() {
    const rows = await this.fetchRows();
    return { data: rows, error: null };
  }

  private async fetchRows() {
    return this.client.queryTable(this.table, this.eqFilters, this.gtFilters, this.orderFilter);
  }
}

class MockSupabaseClientImpl {
  private plan: PlanState;
  private currentVersion: number;

  constructor() {
    this.plan = clonePlan();
    this.currentVersion = this.plan.snapshots.at(-1)?.version ?? 0;
  }

  resetState() {
    this.plan = clonePlan();
    this.currentVersion = this.plan.snapshots.at(-1)?.version ?? 0;
  }

  async rpc(name: string, params: Record<string, any>) {
    switch (name) {
      case 'create_full_plan': {
        this.resetState();
        this.plan.title = params._title ?? this.plan.title;
        const snapshot = this.plan.snapshots[0];
        snapshot.updated_at = new Date().toISOString();
        this.currentVersion = snapshot.version ?? 0;
        return {
          data: {
            plan_id: this.plan.plan_id,
            public_slug: this.plan.public_slug,
            edit_token: this.plan.edit_token,
          },
          error: null,
        };
      }
      case 'append_plan_events': {
        const planId = params.plan_id as string;
        const baseVersion = Number(params.base_version ?? 0);
        const events = Array.isArray(params.events) ? params.events : [];

        if (planId !== this.plan.plan_id) {
          return { data: null, error: new Error('Unknown plan') };
        }
        if (baseVersion !== this.currentVersion) {
          return {
            data: {
              version: this.currentVersion,
              inserted_events: [] as PlanEventRow[],
            },
            error: null,
          };
        }

        const inserted: PlanEventRow[] = events.map((event: any) => {
          this.currentVersion += 1;
          const stored: PlanEventRow = {
            event_id: event.id,
            plan_id: planId,
            version: this.currentVersion,
            event_type: event.type,
            payload: event.payload,
            created_at: new Date().toISOString(),
            actor_id: event.actorId ?? null,
          };
          this.plan.events.push(stored);
          return stored;
        });

        const snapshot = this.plan.snapshots[0];
        snapshot.version = this.currentVersion;
        snapshot.updated_at = new Date().toISOString();

        return {
          data: {
            version: this.currentVersion,
            inserted_events: inserted,
          },
          error: null,
        };
      }
      case 'update_plan_title': {
        if (params._plan_id === this.plan.plan_id) {
          this.plan.title = params._new_title ?? this.plan.title;
        }
        return { data: null, error: null };
      }
      default:
        return { data: null, error: new Error(`Unsupported RPC: ${name}`) };
    }
  }

  from(table: TableName) {
    return new MockQueryBuilder(table, this);
  }

  channel() {
    return new MockRealtimeChannel();
  }

  queryTable(table: TableName, eq: EqFilters, gt: GtFilters, order: OrderFilter | null) {
    if (table === 'plan_snapshots') {
      let rows = [...this.plan.snapshots];
      if (eq.plan_id) {
        rows = rows.filter((row) => row.plan_id === eq.plan_id);
      }
      return rows.map((row) => ({ ...row }));
    }

    let rows = [...this.plan.events];
    if (eq.plan_id) {
      rows = rows.filter((row) => row.plan_id === eq.plan_id);
    }
    if (gt.version != null) {
      rows = rows.filter((row) => row.version > gt.version);
    }
    if (order?.column === 'version') {
      rows.sort((a, b) =>
        order.ascending ? a.version - b.version : b.version - a.version
      );
    }
    return rows.map((row) => ({ ...row }));
  }
}

type ResettableSupabaseClient = SupabaseClient<Database> & { __reset: () => void };

const GLOBAL_KEY = '__E2E_SUPABASE_CLIENT__';

type SupabaseMockGlobal = typeof globalThis & {
  __E2E_SUPABASE_CLIENT__?: ResettableSupabaseClient;
};

function createResettableClient(): ResettableSupabaseClient {
  const impl = new MockSupabaseClientImpl();
  const client = impl as unknown as ResettableSupabaseClient;
  client.__reset = () => {
    impl.resetState();
  };
  return client;
}

export function createMockSupabaseClient(): SupabaseClient<Database> {
  return createResettableClient();
}

export function getSupabaseMock(): SupabaseClient<Database> {
  const globalScope = globalThis as SupabaseMockGlobal;
  if (!globalScope[GLOBAL_KEY]) {
    globalScope[GLOBAL_KEY] = createResettableClient();
  }
  return globalScope[GLOBAL_KEY];
}

export function resetSupabaseMock(): SupabaseClient<Database> {
  const globalScope = globalThis as SupabaseMockGlobal;
  if (globalScope[GLOBAL_KEY]) {
    globalScope[GLOBAL_KEY].__reset();
    return globalScope[GLOBAL_KEY];
  }
  const client = createResettableClient();
  globalScope[GLOBAL_KEY] = client;
  return client;
}
