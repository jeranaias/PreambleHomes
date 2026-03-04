/* eslint-disable @typescript-eslint/no-explicit-any */
import { MOCK_TABLES, getDemoUser } from "./mock-data";

/**
 * Drop-in mock Supabase client for demo mode.
 * Implements the chainable query builder pattern so existing pages
 * work without any code changes.
 */

type Row = Record<string, unknown>;

// ─── Query Builder ───────────────────────────────────────
class MockQueryBuilder {
  private table: string;
  private rows: Row[];
  private filters: Array<(row: Row) => boolean> = [];
  private _order: { column: string; ascending: boolean } | null = null;
  private _limit: number | null = null;
  private _single = false;
  private _head = false;
  private _count: string | null = null;
  private _selectColumns: string | null = null;

  constructor(table: string) {
    this.table = table;
    // Deep clone so filters don't mutate source
    this.rows = JSON.parse(JSON.stringify(MOCK_TABLES[table] || []));
  }

  select(columns?: string, options?: { count?: string; head?: boolean }) {
    this._selectColumns = columns || "*";
    if (options?.count) this._count = options.count;
    if (options?.head) this._head = true;
    return this;
  }

  eq(column: string, value: unknown) {
    // Handle dot-notation for joined table filters like "buyer_searches.buyer_id"
    const parts = column.split(".");
    if (parts.length === 2) {
      const [joinTable, joinCol] = parts;
      this.filters.push((row) => {
        const joined = row[joinTable];
        if (Array.isArray(joined)) return joined.some((j: any) => j[joinCol] === value);
        if (joined && typeof joined === "object") return (joined as any)[joinCol] === value;
        return false;
      });
    } else {
      this.filters.push((row) => row[column] === value);
    }
    return this;
  }

  neq(column: string, value: unknown) {
    this.filters.push((row) => row[column] !== value);
    return this;
  }

  ilike(column: string, pattern: string) {
    const cleaned = pattern.replace(/%/g, "").toLowerCase();
    this.filters.push((row) => {
      const val = row[column];
      return typeof val === "string" && val.toLowerCase().includes(cleaned);
    });
    return this;
  }

  gte(column: string, value: unknown) {
    this.filters.push((row) => {
      const v = row[column];
      if (v == null) return false;
      return (v as number) >= (value as number);
    });
    return this;
  }

  lte(column: string, value: unknown) {
    this.filters.push((row) => {
      const v = row[column];
      if (v == null) return false;
      return (v as number) <= (value as number);
    });
    return this;
  }

  in(column: string, values: unknown[]) {
    this.filters.push((row) => values.includes(row[column]));
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this._order = { column, ascending: options?.ascending ?? true };
    return this;
  }

  limit(count: number) {
    this._limit = count;
    return this;
  }

  single() {
    this._single = true;
    return this;
  }

  // Mutation methods — no-ops that return success
  insert(records: any) {
    const data = Array.isArray(records) ? records : [records];
    // Return the first inserted record with a fake id
    return new MockMutationBuilder(data[0] ? { ...data[0], id: crypto.randomUUID?.() || "mock-id" } : null);
  }

  update(values: any) {
    // Apply to filtered rows (no-op in mock, just return success)
    return new MockMutationBuilder(values);
  }

  delete() {
    return new MockMutationBuilder(null);
  }

  // Terminal: resolve the query
  private resolve(): { data: any; error: null; count?: number } {
    let result = this.rows;

    // Apply filters
    for (const filter of this.filters) {
      result = result.filter(filter);
    }

    // Apply ordering
    if (this._order) {
      const { column, ascending } = this._order;
      result.sort((a, b) => {
        const va = a[column] as any;
        const vb = b[column] as any;
        if (va == null && vb == null) return 0;
        if (va == null) return 1;
        if (vb == null) return -1;
        if (va < vb) return ascending ? -1 : 1;
        if (va > vb) return ascending ? 1 : -1;
        return 0;
      });
    }

    // Apply limit
    if (this._limit) {
      result = result.slice(0, this._limit);
    }

    // Count-only query
    if (this._head && this._count) {
      return { data: null, error: null, count: result.length };
    }

    // Single row
    if (this._single) {
      return { data: result[0] || null, error: null };
    }

    return { data: result, error: null };
  }

  // Make it thenable so `await supabase.from(...).select(...)` works
  then(resolve: (value: any) => any, reject?: (reason: any) => any) {
    try {
      resolve(this.resolve());
    } catch (e) {
      if (reject) reject(e);
    }
  }
}

// Mutation builder for insert/update/delete chains
class MockMutationBuilder {
  private _data: any;

  constructor(data: any) {
    this._data = data;
  }

  select(_columns?: string) {
    return this;
  }

  single() {
    return this;
  }

  eq(_column: string, _value: unknown) {
    return this;
  }

  then(resolve: (value: any) => any) {
    resolve({ data: this._data, error: null });
  }
}

// ─── Mock Auth ───────────────────────────────────────────
class MockAuth {
  private role: string;

  constructor(role: string) {
    this.role = role;
  }

  async getUser() {
    const user = getDemoUser(this.role);
    return { data: { user }, error: null };
  }

  async signInWithPassword(_credentials: { email: string; password: string }) {
    return { data: { user: getDemoUser(this.role), session: {} }, error: null };
  }

  async signUp(_options: any) {
    return { data: { user: getDemoUser(this.role), session: {} }, error: null };
  }

  async signOut() {
    return { error: null };
  }

  onAuthStateChange(_callback: any) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
}

// ─── Main Mock Client ────────────────────────────────────
export function createMockClient(role = "buyer") {
  return {
    auth: new MockAuth(role),

    from(table: string) {
      return new MockQueryBuilder(table);
    },

    rpc(_name: string, _params?: any) {
      return new MockMutationBuilder(null);
    },

    storage: {
      from(_bucket: string) {
        return {
          upload: async () => ({ data: { path: "demo/mock-photo.jpg" }, error: null }),
          getPublicUrl: (path: string) => ({ data: { publicUrl: path } }),
        };
      },
    },
  };
}

// ─── Demo mode detection ─────────────────────────────────
export function isDemoMode(): boolean {
  if (typeof document !== "undefined") {
    // Client-side: check cookie
    return document.cookie.includes("demo_access=granted");
  }
  return false;
}

export function getDemoRole(): string {
  if (typeof document !== "undefined") {
    const match = document.cookie.match(/demo_role=(\w+)/);
    return match?.[1] || "buyer";
  }
  return "buyer";
}
