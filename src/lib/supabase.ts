// ============================================================
// CMe Platform — Supabase Client (Prototype Stub)
// Replace this with the real @supabase/supabase-js client
// once VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.
// The mock mirrors the Supabase query-builder API shape so
// all downstream components can be written to spec now.
// ============================================================

type QueryResult<T> = Promise<{ data: T | null; error: { message: string } | null }>;

interface QueryBuilder<T> {
  select: (columns?: string) => QueryBuilder<T>;
  eq: (column: string, value: unknown) => QueryBuilder<T>;
  single: () => QueryResult<T>;
  then: <R>(fn: (result: { data: T | null; error: null }) => R) => Promise<R>;
}

function mockQueryBuilder<T>(
  tableName: string,
  operation: string,
  payload?: unknown,
): QueryBuilder<T> {
  const builder: QueryBuilder<T> = {
    select(_columns?: string) { return builder; },
    eq(_col: string, _val: unknown) { return builder; },
    single(): QueryResult<T> {
      console.log(`[supabase mock] ${operation} from "${tableName}" (single)`);
      return Promise.resolve({ data: null, error: null });
    },
    then<R>(fn: (result: { data: T | null; error: null }) => R): Promise<R> {
      console.log(`[supabase mock] ${operation} from "${tableName}"`, payload ?? '');
      return Promise.resolve(fn({ data: null, error: null }));
    },
  };
  return builder;
}

export const supabase = {
  from<T = Record<string, unknown>>(tableName: string) {
    return {
      select(columns = '*') {
        return mockQueryBuilder<T>(tableName, 'SELECT', columns);
      },
      upsert(payload: unknown): QueryResult<T> {
        console.log(`[supabase mock] UPSERT into "${tableName}"`, payload);
        return Promise.resolve({ data: null, error: null });
      },
    };
  },
};
