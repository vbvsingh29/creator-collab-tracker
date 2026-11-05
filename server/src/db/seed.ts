import { db, initDB } from './database';
import { v4 as uuidv4 } from 'uuid';
import { hashPassword } from '../utils/security';

export function seed() {
  initDB();

  // Clear existing data
  db.prepare('DELETE FROM collabs').run();
  db.prepare('DELETE FROM brands').run();
  db.prepare('DELETE FROM users').run();

  // 1. Create Demo Creators with scrypt secure hashing
  const defaultPassword = 'password123';
  const passwordHash = hashPassword(defaultPassword);
  const now = new Date().toISOString();

  const userAaravId = uuidv4();
  const userPriyaId = uuidv4();

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password_hash, handle, platform, avatar_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run(
    userAaravId,
    'Aarav Sharma',
    'aarav@tech.com',
    passwordHash,
    '@aaravtech',
    'youtube',
    'https://api.dicebear.com/7.x/initials/svg?seed=Aarav%20Sharma&backgroundColor=b6e3f4,c0aede,d1d4f9',
    now
  );

  insertUser.run(
    userPriyaId,
    'Priya Mehta',
    'priya@lifestyle.com',
    passwordHash,
    '@priyastyle',
    'instagram',
    'https://api.dicebear.com/7.x/initials/svg?seed=Priya%20Mehta&backgroundColor=ffd5dc,ffdfba,d1d4f9',
    now
  );

  console.log('✓ Created 2 Demo Creators:');
  console.log('   1. Aarav Sharma (Tech/YouTube): aarav@tech.com / password123');
  console.log('   2. Priya Mehta (Beauty/Instagram): priya@lifestyle.com / password123');

  // 2. Create Brands
  const brands = [
    {
      id: uuidv4(),
      name: 'NordVPN',
      category: 'Software & Cybersecurity',
      contact_person: 'Elena Rostova (Global Influencer Manager)',
      contact_email: 'elena.rostova@nordsec-partners.com',
      contact_phone: '+1 415 890 2311',
      avg_payment_speed_days: 28,
      rating: 5,
      notes: 'Reliable, sends clear brief decks, Net 30 strictly followed with ACH transfer.',
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      name: 'Dyson India',
      category: 'Consumer Electronics & Grooming',
      contact_person: 'Rhea Mehta (Agency Lead at Ogilvy PR)',
      contact_email: 'rhea.mehta@ogilvy-pr.in',
      contact_phone: '+91 98201 44321',
      avg_payment_speed_days: 45,
      rating: 4,
      notes: 'Requires 30-day Meta ad whitelisting. Finance department is slow on invoices (takes 45 days).',
      created_at: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      name: 'Keychron',
      category: 'Computer Peripherals',
      contact_person: 'Kevin Zhao',
      contact_email: 'collab@keychron.com',
      contact_phone: '',
      avg_payment_speed_days: 0,
      rating: 5,
      notes: 'Barter gifting partner. Sends latest custom mechanical keyboards for desk setup features.',
      created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      name: 'Nothing Technology',
      category: 'Smartphones & Audio',
      contact_person: 'Akash Sharma (Head of Creator Relations)',
      contact_email: 'akash.s@nothing.tech',
      contact_phone: '+91 99112 33445',
      avg_payment_speed_days: 18,
      rating: 5,
      notes: 'Super creator friendly, fast approvals, requires embargo adherence until launch time.',
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      name: 'Minimalist Skincare',
      category: 'Beauty & Personal Care',
      contact_person: 'Pooja Varma',
      contact_email: 'creators@beminimalist.co',
      contact_phone: '+91 97110 55667',
      avg_payment_speed_days: 14,
      rating: 5,
      notes: 'Great Story campaign partner with trackable coupon code. Pays advance within 7 days.',
      created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      name: 'boAt Lifestyle',
      category: 'Audio & Wearables',
      contact_person: 'Siddharth Roy',
      contact_email: 'siddharth.roy@boat-lifestyle.com',
      contact_phone: '+91 98800 11223',
      avg_payment_speed_days: 35,
      rating: 4,
      notes: 'Shorts & Reels campaigns. Always wants product unboxing in first 3 seconds.',
      created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const insertBrand = db.prepare(`
    INSERT INTO brands (id, name, category, contact_person, contact_email, contact_phone, avg_payment_speed_days, rating, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const b of brands) {
    insertBrand.run(b.id, b.name, b.category, b.contact_person, b.contact_email, b.contact_phone, b.avg_payment_speed_days, b.rating, b.notes, b.created_at);
  }

  const today = new Date();
  const formatOffset = (days: number) => {
    const d = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  };

  // 3. Collabs mapped to Creators
  const collabs = [
    // Aarav Tech Deals (4 deals)
    {
      id: uuidv4(),
      user_id: userAaravId,
      title: 'NordVPN 60s Mid-Roll Integration in "My 2026 Developer Setup"',
      brand_id: brands[0].id,
      brand_name: 'NordVPN',
      brand_category: 'Software & Cybersecurity',
      contact_person: brands[0].contact_person,
      contact_email: brands[0].contact_email,
      platform: 'youtube',
      deliverable_format: 'yt_integrated_midroll',
      format_label: 'YouTube 60s Mid-Roll Sponsor',
      commercial_type: 'paid',
      currency: 'USD',
      deal_amount: 1800,
      barter_estimated_value: 0,
      payment_terms: 'net_30',
      payment_status: 'invoiced',
      amount_paid: 0,
      invoice_number: 'INV-2026-081',
      invoice_date: formatOffset(-14),
      payment_due_date: formatOffset(16),
      payment_received_date: null,
      has_ads_whitelisting: 0,
      whitelisting_duration_days: 0,
      whitelisting_expiry_date: null,
      has_category_exclusivity: 1,
      exclusivity_days: 30,
      promo_code: 'TECHCREATOR70',
      tracking_link: 'https://nordvpn.com/techcreator',
      pipeline_stage: 'posted_live',
      scheduled_post_date: formatOffset(-14),
      actual_posted_date: formatOffset(-14),
      live_post_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
      views_count: 84200,
      likes_count: 5310,
      deliverables_checklist: JSON.stringify([
        { id: '1', task: '60s natural spoken integration around minute 04:20', completed: true },
        { id: '2', task: 'Pinned comment with tracking link & 70% off discount code', completed: true },
        { id: '3', task: 'Top 3 lines of description must include disclaimer & link', completed: true }
      ]),
      notes: 'Brand approved script on Draft 1. Provided custom 4K B-roll animations.',
      created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      user_id: userAaravId,
      title: 'Nothing Ear (open) TWS Earbuds Dedicated YouTube Video',
      brand_id: brands[3].id,
      brand_name: 'Nothing Technology',
      brand_category: 'Smartphones & Audio',
      contact_person: brands[3].contact_person,
      contact_email: brands[3].contact_email,
      platform: 'youtube',
      deliverable_format: 'yt_dedicated_video',
      format_label: 'YouTube Dedicated 10-Min In-Depth Review',
      commercial_type: 'paid',
      currency: 'INR',
      deal_amount: 95000,
      barter_estimated_value: 17999,
      payment_terms: '50_advance_50_post',
      payment_status: 'partially_paid',
      amount_paid: 47500,
      invoice_number: 'INV-2026-083',
      invoice_date: formatOffset(-7),
      payment_due_date: formatOffset(8),
      payment_received_date: null,
      has_ads_whitelisting: 1,
      whitelisting_duration_days: 60,
      whitelisting_expiry_date: formatOffset(53),
      has_category_exclusivity: 1,
      exclusivity_days: 14,
      promo_code: 'NOTHINGCREATOR',
      tracking_link: 'https://nothing.tech/products/ear-open',
      pipeline_stage: 'posted_live',
      scheduled_post_date: formatOffset(-7),
      actual_posted_date: formatOffset(-7),
      live_post_url: 'https://youtube.com/watch?v=kXYiU_JCYtU',
      views_count: 142000,
      likes_count: 9800,
      deliverables_checklist: JSON.stringify([
        { id: '1', task: 'Dedicated 8-12 minute honest review highlighting OpenSound tech', completed: true },
        { id: '2', task: 'Provide draft 48 hours prior to launch embargo', completed: true },
        { id: '3', task: 'Pin comment with Nothing.tech official purchase link', completed: true }
      ]),
      notes: 'Embargo lifted smoothly. Review was well received with 142k views in 7 days.',
      created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      user_id: userAaravId,
      title: 'Keychron Q1 Pro Wireless Keyboard (Barter Desk Setup Feature)',
      brand_id: brands[2].id,
      brand_name: 'Keychron',
      brand_category: 'Computer Peripherals',
      contact_person: brands[2].contact_person,
      contact_email: brands[2].contact_email,
      platform: 'both',
      deliverable_format: 'ig_mention',
      format_label: 'Soft Shoutout / Name Drop in Desk Tour',
      commercial_type: 'barter',
      currency: 'INR',
      deal_amount: 0,
      barter_estimated_value: 16500,
      payment_terms: 'barter_only',
      payment_status: 'barter_delivered',
      amount_paid: 0,
      invoice_number: 'N/A (Barter)',
      invoice_date: null,
      payment_due_date: null,
      payment_received_date: null,
      has_ads_whitelisting: 0,
      whitelisting_duration_days: 0,
      whitelisting_expiry_date: null,
      has_category_exclusivity: 0,
      exclusivity_days: 0,
      promo_code: '',
      tracking_link: 'https://keychron.in/q1-pro',
      pipeline_stage: 'completed',
      scheduled_post_date: formatOffset(-20),
      actual_posted_date: formatOffset(-20),
      live_post_url: 'https://instagram.com/reel/C2bN8k9PxZ3',
      views_count: 67000,
      likes_count: 4200,
      deliverables_checklist: JSON.stringify([
        { id: '1', task: 'Include keyboard on desk in 1 Reel and 1 YouTube short', completed: true },
        { id: '2', task: 'Tag @keychron in reel caption', completed: true }
      ]),
      notes: 'Product received in great condition. Pure gifted barter collaboration.',
      created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      user_id: userAaravId,
      title: 'boAt Nirvana ANC Earbuds YouTube Short + Instagram Reel Cross-Post',
      brand_id: brands[5].id,
      brand_name: 'boAt Lifestyle',
      brand_category: 'Audio & Wearables',
      contact_person: brands[5].contact_person,
      contact_email: brands[5].contact_email,
      platform: 'both',
      deliverable_format: 'yt_short',
      format_label: 'YouTube Short & IG Reel Cross-Post',
      commercial_type: 'paid',
      currency: 'INR',
      deal_amount: 50000,
      barter_estimated_value: 3999,
      payment_terms: 'net_30',
      payment_status: 'unbilled',
      amount_paid: 0,
      invoice_number: '',
      invoice_date: null,
      payment_due_date: null,
      payment_received_date: null,
      has_ads_whitelisting: 0,
      whitelisting_duration_days: 0,
      whitelisting_expiry_date: null,
      has_category_exclusivity: 1,
      exclusivity_days: 15,
      promo_code: 'BOATBASS',
      tracking_link: 'https://boat-lifestyle.com/nirvana',
      pipeline_stage: 'content_production',
      scheduled_post_date: formatOffset(5),
      actual_posted_date: null,
      live_post_url: '',
      views_count: 0,
      likes_count: 0,
      deliverables_checklist: JSON.stringify([
        { id: '1', task: 'Draft script submitted to brand', completed: true },
        { id: '2', task: 'Film high energy 30s vertical video focusing on ANC', completed: false }
      ]),
      notes: 'Script approved by Siddharth on WhatsApp. Filming this Wednesday.',
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },

    // Priya Lifestyle Deals (3 deals)
    {
      id: uuidv4(),
      user_id: userPriyaId,
      title: 'Dyson Supersonic Nural Hair Dryer Dedicated Reel + Whitelisting',
      brand_id: brands[1].id,
      brand_name: 'Dyson India',
      brand_category: 'Consumer Electronics & Grooming',
      contact_person: brands[1].contact_person,
      contact_email: brands[1].contact_email,
      platform: 'instagram',
      deliverable_format: 'ig_dedicated_reel',
      format_label: 'Instagram Dedicated Reel (High Production)',
      commercial_type: 'paid',
      currency: 'INR',
      deal_amount: 120000,
      barter_estimated_value: 44900,
      payment_terms: 'net_30',
      payment_status: 'overdue',
      amount_paid: 0,
      invoice_number: 'INV-2026-074',
      invoice_date: formatOffset(-42),
      payment_due_date: formatOffset(-12),
      payment_received_date: null,
      has_ads_whitelisting: 1,
      whitelisting_duration_days: 30,
      whitelisting_expiry_date: formatOffset(18),
      has_category_exclusivity: 1,
      exclusivity_days: 45,
      promo_code: 'DYSONCREATOR10',
      tracking_link: 'https://dyson.in/supersonic-creator',
      pipeline_stage: 'posted_live',
      scheduled_post_date: formatOffset(-42),
      actual_posted_date: formatOffset(-42),
      live_post_url: 'https://instagram.com/reel/C3zYp9L0xA1',
      views_count: 235000,
      likes_count: 18400,
      deliverables_checklist: JSON.stringify([
        { id: '1', task: 'Dedicated 60-second aesthetic unboxing and demo', completed: true },
        { id: '2', task: 'Include Paid Partnership tag with @dyson_india', completed: true },
        { id: '3', task: 'Meta Ad Whitelisting access granted to Ogilvy Ads Manager', completed: true }
      ]),
      notes: 'URGENT: Payment is 12 days overdue! Emailed Rhea Mehta twice. Follow up today.',
      created_at: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      user_id: userPriyaId,
      title: 'Minimalist SPF 50 Sunscreen 3x Instagram Story Sequence',
      brand_id: brands[4].id,
      brand_name: 'Minimalist Skincare',
      brand_category: 'Beauty & Personal Care',
      contact_person: brands[4].contact_person,
      contact_email: brands[4].contact_email,
      platform: 'instagram',
      deliverable_format: 'ig_story',
      format_label: 'Instagram Story (3 Frames + Link Sticker)',
      commercial_type: 'paid',
      currency: 'INR',
      deal_amount: 35000,
      barter_estimated_value: 0,
      payment_terms: 'net_15',
      payment_status: 'paid',
      amount_paid: 35000,
      invoice_number: 'INV-2026-079',
      invoice_date: formatOffset(-22),
      payment_due_date: formatOffset(-7),
      payment_received_date: formatOffset(-8),
      has_ads_whitelisting: 0,
      whitelisting_duration_days: 0,
      whitelisting_expiry_date: null,
      has_category_exclusivity: 0,
      exclusivity_days: 0,
      promo_code: 'CREATORGLOW15',
      tracking_link: 'https://beminimalist.co/collections/sunscreen?ref=creator',
      pipeline_stage: 'completed',
      scheduled_post_date: formatOffset(-22),
      actual_posted_date: formatOffset(-22),
      live_post_url: 'https://instagram.com/stories/highlights/17923412093847/',
      views_count: 42000,
      likes_count: 1250,
      deliverables_checklist: JSON.stringify([
        { id: '1', task: 'Frame 1: Morning routine without white cast', completed: true },
        { id: '2', task: 'Frame 2: Texture application close-up with #ad disclaimer', completed: true },
        { id: '3', task: 'Frame 3: Clickable sticker link with promo code CREATORGLOW15', completed: true }
      ]),
      notes: 'Generated 380 direct link clicks according to brand report. Paid on time.',
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      user_id: userPriyaId,
      title: 'Ray-Ban Meta Smart Glasses Integrated Reel (Brand Review Stage)',
      brand_id: brands[1].id,
      brand_name: 'Dyson India',
      brand_category: 'Smart Eyewear & Tech',
      contact_person: brands[1].contact_person,
      contact_email: brands[1].contact_email,
      platform: 'instagram',
      deliverable_format: 'ig_integrated_reel',
      format_label: 'Instagram Integrated Reel (30s Segment)',
      commercial_type: 'paid',
      currency: 'INR',
      deal_amount: 80000,
      barter_estimated_value: 32000,
      payment_terms: '50_advance_50_post',
      payment_status: 'partially_paid',
      amount_paid: 40000,
      invoice_number: 'INV-2026-085',
      invoice_date: formatOffset(-3),
      payment_due_date: formatOffset(12),
      payment_received_date: null,
      has_ads_whitelisting: 1,
      whitelisting_duration_days: 30,
      whitelisting_expiry_date: null,
      has_category_exclusivity: 1,
      exclusivity_days: 30,
      promo_code: '',
      tracking_link: 'https://ray-ban.com/meta',
      pipeline_stage: 'brand_review',
      scheduled_post_date: formatOffset(4),
      actual_posted_date: null,
      live_post_url: '',
      views_count: 0,
      likes_count: 0,
      deliverables_checklist: JSON.stringify([
        { id: '1', task: 'First draft submitted via Frame.io for brand review', completed: true },
        { id: '2', task: 'Brand feedback round 1 (requested louder POV audio)', completed: true }
      ]),
      notes: 'Awaiting final approval from regional marketing lead before scheduling.',
      created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const insertCollab = db.prepare(`
    INSERT INTO collabs (
      id, user_id, title, brand_id, brand_name, brand_category, contact_person, contact_email,
      platform, deliverable_format, format_label, commercial_type, currency,
      deal_amount, barter_estimated_value, payment_terms, payment_status, amount_paid,
      invoice_number, invoice_date, payment_due_date, payment_received_date,
      has_ads_whitelisting, whitelisting_duration_days, whitelisting_expiry_date,
      has_category_exclusivity, exclusivity_days, promo_code, tracking_link,
      pipeline_stage, scheduled_post_date, actual_posted_date, live_post_url,
      views_count, likes_count, deliverables_checklist, notes, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?
    )
  `);

  for (const c of collabs) {
    insertCollab.run(
      c.id, c.user_id, c.title, c.brand_id, c.brand_name, c.brand_category, c.contact_person, c.contact_email,
      c.platform, c.deliverable_format, c.format_label, c.commercial_type, c.currency,
      c.deal_amount, c.barter_estimated_value, c.payment_terms, c.payment_status, c.amount_paid,
      c.invoice_number, c.invoice_date, c.payment_due_date, c.payment_received_date,
      c.has_ads_whitelisting, c.whitelisting_duration_days, c.whitelisting_expiry_date,
      c.has_category_exclusivity, c.exclusivity_days, c.promo_code, c.tracking_link,
      c.pipeline_stage, c.scheduled_post_date, c.actual_posted_date, c.live_post_url,
      c.views_count, c.likes_count, c.deliverables_checklist, c.notes, c.created_at, c.updated_at
    );
  }

  console.log(`✓ Seeded ${brands.length} brands and ${collabs.length} creator-isolated collaborations successfully.`);
}

if (require.main === module) {
  seed();
}
