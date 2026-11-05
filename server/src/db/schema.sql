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
  title TEXT NOT NULL,
  brand_id TEXT,
  brand_name TEXT NOT NULL,
  brand_category TEXT DEFAULT 'General',
  contact_person TEXT DEFAULT '',
  contact_email TEXT DEFAULT '',
  platform TEXT NOT NULL, -- 'instagram', 'youtube', 'both'
  deliverable_format TEXT NOT NULL, -- 'ig_mention', 'ig_story', 'ig_integrated_reel', etc.
  format_label TEXT DEFAULT '',
  commercial_type TEXT NOT NULL, -- 'paid', 'barter', 'affiliate', 'hybrid'
  currency TEXT DEFAULT 'INR', -- 'INR', 'USD', 'EUR', 'GBP'
  deal_amount REAL DEFAULT 0,
  barter_estimated_value REAL DEFAULT 0,
  payment_terms TEXT NOT NULL, -- '100_upfront', '50_advance_50_post', 'net_15', 'net_30', etc.
  payment_status TEXT NOT NULL, -- 'unbilled', 'invoiced', 'overdue', 'partially_paid', 'paid', 'barter_delivered'
  amount_paid REAL DEFAULT 0,
  invoice_number TEXT DEFAULT '',
  invoice_date TEXT,
  payment_due_date TEXT,
  payment_received_date TEXT,
  has_ads_whitelisting INTEGER DEFAULT 0, -- 0 or 1
  whitelisting_duration_days INTEGER DEFAULT 0,
  whitelisting_expiry_date TEXT,
  has_category_exclusivity INTEGER DEFAULT 0, -- 0 or 1
  exclusivity_days INTEGER DEFAULT 0,
  promo_code TEXT DEFAULT '',
  tracking_link TEXT DEFAULT '',
  pipeline_stage TEXT NOT NULL, -- 'pitch_inquiry', 'negotiating', 'script_approved', etc.
  scheduled_post_date TEXT,
  actual_posted_date TEXT,
  live_post_url TEXT DEFAULT '',
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  deliverables_checklist TEXT DEFAULT '[]', -- JSON array of checklist items
  notes TEXT DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(brand_id) REFERENCES brands(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_collabs_platform ON collabs(platform);
CREATE INDEX IF NOT EXISTS idx_collabs_commercial_type ON collabs(commercial_type);
CREATE INDEX IF NOT EXISTS idx_collabs_payment_status ON collabs(payment_status);
CREATE INDEX IF NOT EXISTS idx_collabs_pipeline_stage ON collabs(pipeline_stage);
