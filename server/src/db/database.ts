import { TursoAdapter } from './tursoAdapter';

let adapterInstance: TursoAdapter | null = null;

function getAdapter(): TursoAdapter {
  if (adapterInstance) return adapterInstance;

  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;

  if (!url || !token) {
    throw new Error(
      'DATABASE_CONNECTION_ERROR: Local SQLite has been completely decommissioned. ' +
      'TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be configured in environment variables to connect to the hosted database.'
    );
  }

  adapterInstance = new TursoAdapter(url, token);
  return adapterInstance;
}

/**
 * Universal Database Interface:
 * Routes all queries directly to the hosted cloud database (Turso / LibSQL over REST pipeline).
 * Completely eliminates local SQLite file dependencies and native C++ binary bindings.
 */
export const db = {
  prepare(sql: string) {
    return {
      async get<T = any>(...params: any[]): Promise<T | undefined> {
        const adapter = getAdapter();
        const p = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        const res = await adapter.execute<T>(sql, p);
        return res.rows[0];
      },
      async all<T = any>(...params: any[]): Promise<T[]> {
        const adapter = getAdapter();
        const p = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        const res = await adapter.execute<T>(sql, p);
        return res.rows;
      },
      async run(...params: any[]): Promise<{ changes: number; lastInsertRowid?: any }> {
        const adapter = getAdapter();
        const p = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        const res = await adapter.execute(sql, p);
        return { changes: res.rowsAffected, lastInsertRowid: res.lastInsertRowid };
      }
    };
  },
  async exec(sql: string): Promise<void> {
    const adapter = getAdapter();
    await adapter.execute(sql);
  },
  pragma(_cmd: string): any {
    // Pragmas are not applicable on remote cloud LibSQL
    return [];
  }
};

export function initDB() {
  console.log('📡 [Database Layer] Local SQLite completely decommissioned. Strict hosted database mode active.');
}
