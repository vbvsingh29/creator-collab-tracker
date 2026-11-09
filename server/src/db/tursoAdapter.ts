/**
 * tursoAdapter.ts
 * High-performance, zero-native-dependency HTTP REST pipeline client for Turso Cloud (LibSQL).
 * Connects directly to https://<db-name>.turso.io/v2/pipeline using standard Node 20+ fetch.
 * Runs anywhere without C++ compilation or native binary mismatch.
 */

export interface TursoQueryResult<T = any> {
  rows: T[];
  columns: string[];
  rowsAffected: number;
  lastInsertRowid?: number | string;
}

export class TursoAdapter {
  private pipelineUrl: string;
  private authToken: string;

  constructor(databaseUrl: string, authToken: string) {
    if (!databaseUrl || !authToken) {
      throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required.');
    }
    // Convert libsql:// or https:// to standard Turso /v2/pipeline endpoint
    const base = databaseUrl.replace(/^libsql:\/\//i, 'https://').replace(/\/$/, '');
    this.pipelineUrl = `${base}/v2/pipeline`;
    this.authToken = authToken.trim();
  }

  /**
   * Format JS parameters into LibSQL pipeline argument objects
   */
  private formatArgs(params: any[] = []): any[] {
    return params.map(p => {
      if (p === null || p === undefined) return { type: 'null' };
      if (typeof p === 'number') {
        return Number.isInteger(p)
          ? { type: 'integer', value: p.toString() }
          : { type: 'float', value: p };
      }
      if (typeof p === 'boolean') {
        return { type: 'integer', value: p ? '1' : '0' };
      }
      return { type: 'text', value: String(p) };
    });
  }

  /**
   * Execute a single SQL statement against Turso Cloud
   */
  async execute<T = any>(sql: string, params: any[] = []): Promise<TursoQueryResult<T>> {
    const payload = {
      requests: [
        {
          type: 'execute',
          stmt: {
            sql: sql.trim(),
            args: this.formatArgs(params)
          }
        },
        { type: 'close' }
      ]
    };

    const res = await fetch(this.pipelineUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Turso HTTP ${res.status}: ${errText}`);
    }

    const data: any = await res.json();
    const result = data?.results?.[0];

    if (result?.type === 'error') {
      throw new Error(`Turso SQL Error: ${result.error?.message || JSON.stringify(result.error)}`);
    }

    const execResult = result?.response?.result;
    if (!execResult) {
      return { rows: [], columns: [], rowsAffected: 0 };
    }

    const cols: string[] = (execResult.cols || []).map((c: any) => c.name);
    const rows: T[] = (execResult.rows || []).map((row: any[]) => {
      const obj: any = {};
      row.forEach((cell, idx) => {
        obj[cols[idx]] = cell.value !== undefined ? cell.value : null;
      });
      return obj as T;
    });

    return {
      rows,
      columns: cols,
      rowsAffected: execResult.affected_row_count || 0,
      lastInsertRowid: execResult.last_insert_rowid
    };
  }

  /**
   * Execute multiple SQL statements in a single atomic batch
   */
  async batch(statements: Array<{ sql: string; params?: any[] }>): Promise<any[]> {
    const requests = statements.map(st => ({
      type: 'execute',
      stmt: {
        sql: st.sql.trim(),
        args: this.formatArgs(st.params || [])
      }
    }));
    requests.push({ type: 'close' } as any);

    const res = await fetch(this.pipelineUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Turso Batch HTTP ${res.status}: ${errText}`);
    }

    const data: any = await res.json();
    return data?.results || [];
  }
}

/**
 * Initialize all database tables on Turso Cloud if they do not exist yet.
 */
export async function initializeTursoSchema(adapter: TursoAdapter): Promise<void> {
  const schemaStatements = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      handle TEXT DEFAULT '',
      platform TEXT DEFAULT 'both',
      avatar_url TEXT DEFAULT '',
      role TEXT DEFAULT 'creator',
      bio TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      category TEXT DEFAULT '',
      rates_json TEXT DEFAULT '{}',
      social_links_json TEXT DEFAULT '{}',
      email_verified INTEGER DEFAULT 0,
      phone_verified INTEGER DEFAULT 0,
      social_accounts_json TEXT DEFAULT '[]',
      team_members_json TEXT DEFAULT '[]',
      created_at TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS brands (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      contact_person TEXT DEFAULT '',
      contact_email TEXT DEFAULT '',
      contact_phone TEXT DEFAULT '',
      avg_payment_speed_days INTEGER DEFAULT 30,
      rating INTEGER DEFAULT 5,
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS collabs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      title TEXT NOT NULL,
      brand_id TEXT,
      brand_name TEXT NOT NULL,
      brand_category TEXT DEFAULT 'General',
      contact_person TEXT DEFAULT '',
      contact_email TEXT DEFAULT '',
      platform TEXT NOT NULL,
      deliverable_format TEXT NOT NULL,
      format_label TEXT DEFAULT '',
      commercial_type TEXT NOT NULL,
      currency TEXT DEFAULT 'INR',
      deal_amount REAL DEFAULT 0,
      barter_estimated_value REAL DEFAULT 0,
      payment_terms TEXT NOT NULL,
      payment_status TEXT NOT NULL,
      amount_paid REAL DEFAULT 0,
      invoice_number TEXT DEFAULT '',
      invoice_date TEXT,
      payment_due_date TEXT,
      payment_received_date TEXT,
      has_ads_whitelisting INTEGER DEFAULT 0,
      whitelisting_duration_days INTEGER DEFAULT 0,
      whitelisting_expiry_date TEXT,
      has_category_exclusivity INTEGER DEFAULT 0,
      exclusivity_days INTEGER DEFAULT 0,
      promo_code TEXT DEFAULT '',
      tracking_link TEXT DEFAULT '',
      pipeline_stage TEXT DEFAULT 'pitch_inquiry',
      scheduled_post_date TEXT,
      actual_posted_date TEXT,
      agency_cut_percentage REAL DEFAULT 0,
      tds_percentage REAL DEFAULT 0,
      deliverables_checklist TEXT DEFAULT '[]',
      live_post_url TEXT DEFAULT '',
      views_count INTEGER DEFAULT 0,
      likes_count INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,
      last_metrics_sync TEXT,
      account_id TEXT DEFAULT '',
      account_label TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS password_resets (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      code_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS verifications (
      id TEXT PRIMARY KEY,
      target TEXT NOT NULL,
      type TEXT NOT NULL,
      code_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS communication_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      recipient TEXT NOT NULL,
      channel TEXT NOT NULL,
      purpose TEXT NOT NULL,
      status TEXT NOT NULL,
      provider TEXT NOT NULL,
      details TEXT DEFAULT '',
      created_at TEXT NOT NULL
    );`
  ];

  console.log('🌐 [Turso Cloud] Initializing schema and tables...');
  await adapter.batch(schemaStatements.map(sql => ({ sql })));
  console.log('✅ [Turso Cloud] All tables successfully created/verified on remote database!');
  await runTursoMigrations(adapter);
}

/**
 * Run safe column additions for existing tables.
 * Uses ALTER TABLE ... ADD COLUMN in individual try-catches so missing columns are added
 * without failing if already present.
 */
export async function runTursoMigrations(adapter: TursoAdapter): Promise<void> {
  const collabsColumns = [
    { name: 'whitelisting_duration_days', type: 'INTEGER DEFAULT 0' },
    { name: 'whitelisting_expiry_date', type: 'TEXT' },
    { name: 'has_category_exclusivity', type: 'INTEGER DEFAULT 0' },
    { name: 'exclusivity_days', type: 'INTEGER DEFAULT 0' },
    { name: 'promo_code', type: 'TEXT DEFAULT ""' },
    { name: 'tracking_link', type: 'TEXT DEFAULT ""' },
    { name: 'pipeline_stage', type: 'TEXT DEFAULT "pitch_inquiry"' },
    { name: 'scheduled_post_date', type: 'TEXT' },
    { name: 'actual_posted_date', type: 'TEXT' },
    { name: 'format_label', type: 'TEXT DEFAULT ""' },
    { name: 'account_id', type: 'TEXT DEFAULT ""' },
    { name: 'account_label', type: 'TEXT DEFAULT ""' },
    { name: 'agency_cut_percentage', type: 'REAL DEFAULT 0' },
    { name: 'tds_percentage', type: 'REAL DEFAULT 0' },
  ];

  for (const col of collabsColumns) {
    try {
      await adapter.execute(`ALTER TABLE collabs ADD COLUMN ${col.name} ${col.type}`);
      console.log(`✅ [Migration] Added column collabs.${col.name}`);
    } catch (err: any) {
      if (!err.message?.includes('duplicate column')) {
        console.warn(`[Migration info] collabs.${col.name}: ${err.message}`);
      }
    }
  }

  const usersColumns = [
    { name: 'phone', type: 'TEXT DEFAULT ""' },
    { name: 'phone_verified', type: 'INTEGER DEFAULT 0' },
    { name: 'email_verified', type: 'INTEGER DEFAULT 0' },
    { name: 'rates_json', type: 'TEXT DEFAULT "{}"' },
    { name: 'social_links_json', type: 'TEXT DEFAULT "{}"' },
    { name: 'social_accounts_json', type: 'TEXT DEFAULT "[]"' },
    { name: 'team_members_json', type: 'TEXT DEFAULT "[]"' },
    { name: 'bio', type: 'TEXT DEFAULT ""' },
    { name: 'category', type: 'TEXT DEFAULT ""' },
    { name: 'handle', type: 'TEXT DEFAULT ""' },
    { name: 'platform', type: 'TEXT DEFAULT "both"' },
    { name: 'avatar_url', type: 'TEXT DEFAULT ""' },
    { name: 'role', type: 'TEXT DEFAULT "creator"' },
  ];

  for (const col of usersColumns) {
    try {
      await adapter.execute(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
      console.log(`✅ [Migration] Added column users.${col.name}`);
    } catch (err: any) {
      if (!err.message?.includes('duplicate column')) {
        console.warn(`[Migration info] users.${col.name}: ${err.message}`);
      }
    }
  }
}
