import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../collabflow.db');

export const db = new Database(DB_PATH);

// Enable WAL mode for high performance and low lock contention
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  handle TEXT DEFAULT '',
  platform TEXT DEFAULT 'both',
  avatar_url TEXT DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS brands (
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
);

CREATE TABLE IF NOT EXISTS collabs (
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
  pipeline_stage TEXT NOT NULL,
  scheduled_post_date TEXT,
  actual_posted_date TEXT,
  live_post_url TEXT DEFAULT '',
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  deliverables_checklist TEXT DEFAULT '[]',
  notes TEXT DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(brand_id) REFERENCES brands(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_collabs_user_id ON collabs(user_id);
CREATE INDEX IF NOT EXISTS idx_collabs_platform ON collabs(platform);
CREATE INDEX IF NOT EXISTS idx_collabs_commercial_type ON collabs(commercial_type);
CREATE INDEX IF NOT EXISTS idx_collabs_payment_status ON collabs(payment_status);
CREATE INDEX IF NOT EXISTS idx_collabs_pipeline_stage ON collabs(pipeline_stage);

CREATE TABLE IF NOT EXISTS password_resets (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);
`;

// Initialize schema
export function initDB() {
  db.exec(SCHEMA_SQL);
  
  // Safe migration check for existing databases: check if user_id column exists
  const tableInfo = db.prepare("PRAGMA table_info(collabs)").all() as { name: string }[];
  const hasUserId = tableInfo.some(c => c.name === 'user_id');
  if (!hasUserId) {
    db.exec("ALTER TABLE collabs ADD COLUMN user_id TEXT");
    console.log("✓ Added user_id column to existing collabs table");
  }

    // Safe migration check for user profile extensions
  const userCols = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
  const colNames = userCols.map(c => c.name);
  if (!colNames.includes('bio')) db.exec("ALTER TABLE users ADD COLUMN bio TEXT DEFAULT ''");
  if (!colNames.includes('phone')) db.exec("ALTER TABLE users ADD COLUMN phone TEXT DEFAULT ''");
  if (!colNames.includes('category')) db.exec("ALTER TABLE users ADD COLUMN category TEXT DEFAULT ''");
  if (!colNames.includes('rates_json')) db.exec("ALTER TABLE users ADD COLUMN rates_json TEXT DEFAULT '{}'");
  if (!colNames.includes('social_links_json')) db.exec("ALTER TABLE users ADD COLUMN social_links_json TEXT DEFAULT '{}'");
  if (!colNames.includes('role')) db.exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'creator'");
  if (!colNames.includes('email_verified')) db.exec("ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0");
  if (!colNames.includes('phone_verified')) db.exec("ALTER TABLE users ADD COLUMN phone_verified INTEGER DEFAULT 0");
  if (!colNames.includes('social_accounts_json')) db.exec("ALTER TABLE users ADD COLUMN social_accounts_json TEXT DEFAULT '[]'");
  if (!colNames.includes('team_members_json')) db.exec("ALTER TABLE users ADD COLUMN team_members_json TEXT DEFAULT '[]'");

  // Safe migration check for collabs extensions (multi-channel / account tags)
  const collabColNames = tableInfo.map(c => c.name);
  if (!collabColNames.includes('account_id')) db.exec("ALTER TABLE collabs ADD COLUMN account_id TEXT DEFAULT ''");
  if (!collabColNames.includes('account_label')) db.exec("ALTER TABLE collabs ADD COLUMN account_label TEXT DEFAULT ''");

  // Create verifications table for email / phone OTP verification
  db.exec(`
    CREATE TABLE IF NOT EXISTS verifications (
      id TEXT PRIMARY KEY,
      target TEXT NOT NULL,
      type TEXT NOT NULL,
      code_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_verifications_target ON verifications(target);
  `);

  console.log('✓ Database initialized successfully at:', DB_PATH);

  // Automatically update any overdue invoices on startup
  const today = new Date().toISOString().split('T')[0];
  const overdueStmt = db.prepare(`
    UPDATE collabs 
    SET payment_status = 'overdue' 
    WHERE payment_status = 'invoiced' 
      AND payment_due_date IS NOT NULL 
      AND payment_due_date < ?
  `);
  const result = overdueStmt.run(today);
  if (result.changes > 0) {
    console.log(`✓ Automatically marked ${result.changes} deals as overdue based on due date.`);
  }
}
