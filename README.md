# 🎯 CollabFlow — Creator Collaboration Operating System

> The high-performance sponsorship operating system built for **Instagram & YouTube creators, talent managers, and influencer agencies**.
> 
> **Zero generic AI slop**: High-density, tactile, and craft-driven dashboard inspired by Linear and Stripe — built for speed, financial traceability, and zero data leakage.

---

## ⚡ Dual Experience: Simple Mode vs. Advanced Mode

CollabFlow is engineered to adapt to your workflow at any given moment with a 1-click switcher in the top navigation bar:

```
[ Simple Mode ] ◄───────── Switch anytime ─────────► [ Advanced Mode ]
```

### 1. 🟢 Simple Mode (Minimalist & Blazing Fast)
Designed for fast day-to-day logging without cognitive clutter:
- **Dual Layouts**:
  - **Cards Grid**: Clean, high-density deal cards with brand name, deliverable format, deal amount, payment status, live link, and 1-click *Mark Paid*.
  - **Simple Table**: A streamlined table focusing only on the essential columns: Brand, Title, Platform, Deliverable Format, Stage, Deal Value, Payment Status, Content link, and Actions.
- **3-Metric Financial Summary**:
  - Total Collaborations Value (active pipeline volume)
  - Paid in Bank (cleared earnings)
  - Pending Payouts (scheduled payments)
- **Minimalist Search**: Fast search bar by brand name or collab title + quick platform pills (`All`, `Instagram`, `YouTube`).
- **Quick Deal Entry**: Log new deals in under 15 seconds with essential commercial fields.

---

### 2. 🟣 Advanced Mode (Agency & Power-Creator Suite)
Full commercial intelligence suite for multi-platform talent and agency managers:
- **Triple Layouts**:
  - **Pipeline Board (Kanban)**: 8 progression stages (`Pitch & Inquiry` → `Negotiating` → `Script Approved` → `In Production` → `Brand Review` → `Scheduled` → `Posted Live` → `Completed`) with 1-click stage advancement arrows.
  - **Data Table**: Full financial spreadsheet with payment terms, invoice numbers, due dates, ad whitelisting duration, and batch actions.
  - **Cards Grid**: Card view enriched with all advanced power tools and metrics.
- **6-Metric Cashflow Radar**:
  - Gross Pipeline Value
  - Cleared in Bank
  - Pending Payouts
  - ⚠️ Overdue Invoice Tracker
  - Barter & Free Gift Retail Value
  - **True Net Take-Home**: Computes actual cash in bank after **10% TDS (Tax Deducted at Source)** and **15% Agency Commission**.
- **Competitor Exclusivity Collision Radar**: Scans brand categories (e.g. *Smartphones*, *Grooming*, *Fintech*) and warns against signing contracts that breach active exclusivity lockouts.
- **Dynamic Scope & Rate Card Calculator**: Automatic value additions (`+35% for 30d Paid Ads Whitelisting`, `+25% for 30d Exclusivity`, `+20% for Rush Turnaround <72h`).
- **Brand & Agency CRM**: Tracks lifetime spend, average payout time, and direct PR contacts per brand.
- **1-Click Proof Card & Debt Recovery Follow-up**: Generates client verification summaries and 3-stage debt recovery notices (Polite Reminder, Firm Notice, Legal Rights Suspension).

---

## 🔐 Creator-Level Auth & Strict Tenant Isolation

CollabFlow is built with security first to protect confidential creator pricing and contracts:

- **NIST/OWASP Compliant Password Security**: Implements native Node.js `crypto.scryptSync` with 16-byte cryptographically secure random salts and constant-time `timingSafeEqual` comparison to eliminate timing attacks.
- **HMAC-SHA256 JWT Authentication**: Cryptographically signed JSON Web Tokens (30-day expiry) passed via standard `Authorization: Bearer <token>` headers.
- **Strict Tenant Isolation**: Every deal, status update, metric sync, and brand calculation is strictly isolated:
  ```sql
  SELECT * FROM collabs WHERE id = ? AND user_id = ?
  ```
  Brand directories use creator-scoped joins (`LEFT JOIN collabs c ON b.id = c.brand_id AND c.user_id = ?`) so Creator A can never view Creator B's sponsorship rates or deal volume.
- **1-Click Demo Creator Profiles**:
  - 🎥 **Aarav Sharma (`@aaravtech`)** — Tech Creator: 4 YouTube collaborations (NordVPN, Nothing Phone, boAt, Keychron).
  - 📸 **Priya Mehta (`@priyastyle`)** — Beauty & Lifestyle Creator: 3 Instagram collaborations (Dyson Supersonic, Minimalist Skincare, Ray-Ban Meta with Overdue payment alert).

---

## 📺 100% Free Official & Zero-Cost Integrations

CollabFlow integrates YouTube and Instagram tracking without requiring expensive enterprise API subscriptions:

| Platform | Feature | How it Works | Cost |
| :--- | :--- | :--- | :--- |
| **YouTube** | **Live Metrics (Views, Likes, Comments)** | YouTube Data API v3 (1 unit per query = 10,000 queries/day) with automatic zero-key fallback scraper | **Free** |
| **YouTube** | **Official oEmbed Metadata** | Official YouTube oEmbed endpoint pulling video title, author, and channel | **Free** |
| **YouTube** | **In-App Embed Player** | Responsive 1080p/4K iframe player inside the deal inspection drawer | **Free** |
| **YouTube** | **#ad Compliance Scanner** | Inspects title and description for `#ad`, `#sponsored`, or `paid partnership` | **Free** |
| **Instagram** | **Captioned Reel Embed Player** | Official Meta responsive Reel player inside the drawer | **Free** |
| **Instagram** | **Open Graph Crawler** | Fallback parser extracting public likes, comments, and captions | **Free** |
| **Cross-Platform** | **Instant Auto-Fill by URL** | Paste any YouTube video or Instagram Reel link in the *New Collab* modal to auto-detect platform, title, and deliverables | **Free** |
| **Status API** | **Integrations Health Center** | `/api/integrations/status` endpoint monitoring free quotas, connection status, and scrapers | **Free** |

---

## 🏗️ Project Structure

```
creator-collab-tracker/
├── client/                          # Frontend (React 18 + Vite + TypeScript + Tailwind CSS)
│   ├── src/
│   │   ├── components/              # SimpleView, TableView, KanbanBoard, CollabDrawer, Modals
│   │   ├── context/AuthContext.tsx  # Multi-tenant creator auth state
│   │   ├── services/api.ts          # Authenticated REST API client
│   │   ├── types/index.ts           # Strict TypeScript interfaces
│   │   ├── utils/formatters.ts      # Multi-currency & deliverable depth helpers
│   │   └── App.tsx                  # Dashboard controller & layout router
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
├── server/                          # Backend API (Express + TypeScript + SQLite)
│   ├── src/
│   │   ├── db/
│   │   │   ├── database.ts          # SQLite connection (WAL mode) & cloud Turso client
│   │   │   └── seed.ts              # Demo creator accounts and isolated sample deals
│   │   ├── middleware/auth.ts       # Bearer token verification & tenant isolation
│   │   ├── routes/                  # /auth, /collabs, /brands, /stats, /integrations
│   │   ├── services/                # YouTube oEmbed, Instagram crawler, metrics sync
│   │   └── utils/security.ts        # Scrypt password hashing & HMAC-SHA256 JWT
│   ├── tsconfig.json
│   └── package.json
├── render.yaml                      # 1-click free Render backend deployment
├── vercel.json                      # 1-click free Vercel frontend deployment
└── package.json                     # Root orchestrator scripts
```

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** or **pnpm**

### 2. Clone & Install
```bash
# Clone the repository
git clone https://github.com/vbvsingh29/creator-collab-tracker.git
cd creator-collab-tracker

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Initialize & Seed Database
```bash
# From server directory, seed the database with demo creators & sample collabs
cd server
npm run seed
```

### 4. Run Development Servers
Open two terminal windows:

**Terminal 1 (Backend API on Port 5000):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend on Port 5173):**
```bash
cd client
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🌐 100% Free Cloud Deployment Guide

CollabFlow is pre-configured to run **100% free** on cloud providers:

### 1. Database: Free Distributed SQLite via Turso
1. Create a free account at [turso.tech](https://turso.tech).
2. Create a free database:
   ```bash
   turso db create collabflow-db
   turso db show --url collabflow-db
   turso db tokens create collabflow-db
   ```
3. Set the environment variables in your server:
   - `TURSO_DATABASE_URL`: `libsql://your-db-name.turso.io`
   - `TURSO_AUTH_TOKEN`: your generated auth token

### 2. Backend: Free Hosting on Render
1. Create a new **Web Service** on [render.com](https://render.com) connected to your repository.
2. Root Directory: `server`
3. Build Command: `npm install && npm run build`
4. Start Command: `node dist/index.js`
5. Environment Variables:
   - `PORT`: `5000`
   - `JWT_SECRET`: your secret key (or generate with `openssl rand -hex 32`)
   - `TURSO_DATABASE_URL` & `TURSO_AUTH_TOKEN` (from step 1)

### 3. Frontend: Free Hosting on Vercel
1. Import repository on [vercel.com](https://vercel.com).
2. Framework Preset: **Vite**
3. Root Directory: `client`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. In `client/vite.config.ts`, route `/api` to your Render backend URL.

---

## 🔒 Demo Credentials

If testing locally or in demo mode:

| Creator Profile | Email | Password | Specialization |
| :--- | :--- | :--- | :--- |
| **Aarav Sharma** | `aarav@tech.com` | `password123` | YouTube Tech Sponsorships |
| **Priya Mehta** | `priya@lifestyle.com` | `password123` | Instagram Lifestyle & Beauty |

---

## 📜 License
MIT License. Built for modern digital creators, talent managers, and agencies.
