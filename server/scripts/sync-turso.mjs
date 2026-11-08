import dotenv from 'dotenv';
dotenv.config();

const dbUrl = process.env.TURSO_DATABASE_URL || process.argv[2];
const token = process.env.TURSO_AUTH_TOKEN || process.argv[3];

if (!dbUrl || !token) {
  console.error('\n❌ Missing Turso Credentials!');
  console.log('Usage:');
  console.log('  node scripts/sync-turso.mjs <TURSO_DATABASE_URL> <TURSO_AUTH_TOKEN>\n');
  console.log('Or set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in server/.env\n');
  process.exit(1);
}

const pipelineUrl = dbUrl.replace(/^libsql:\/\//i, 'https://').replace(/\/$/, '') + '/v2/pipeline';

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
    whitelisting_duration_months INTEGER DEFAULT 0,
    whitelisting_monthly_fee REAL DEFAULT 0,
    has_exclusivity INTEGER DEFAULT 0,
    exclusivity_duration_months INTEGER DEFAULT 0,
    exclusivity_category TEXT DEFAULT '',
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

async function sync() {
  console.log(`📡 Connecting to Turso Cloud at: ${pipelineUrl}`);
  
  const requests = schemaStatements.map(sql => ({
    type: 'execute',
    stmt: { sql: sql.trim(), args: [] }
  }));
  requests.push({ type: 'close' });

  const res = await fetch(pipelineUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token.trim()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ requests })
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`❌ HTTP Error ${res.status}: ${errText}`);
    process.exit(1);
  }

  const data = await res.json();
  const errors = (data.results || []).filter(r => r.type === 'error');
  if (errors.length > 0) {
    console.error('❌ SQL Errors during schema sync:', JSON.stringify(errors, null, 2));
    process.exit(1);
  }

  console.log('🎉 SUCCESS! All 6 Collabio tables created in Turso Cloud!');
  console.log('   - users');
  console.log('   - brands');
  console.log('   - collabs');
  console.log('   - password_resets');
  console.log('   - verifications');
  console.log('   - communication_logs\n');
  console.log('👉 You can now refresh the "Edit Data" tab in Turso Web Console.');
}

sync().catch(err => {
  console.error('Fatal sync failure:', err.message);
  process.exit(1);
});
