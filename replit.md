# DragonzStore

Premium digital products ecommerce with LTC (Litecoin) crypto payments — instant delivery of gaming keys, accounts, software, and streaming subscriptions.

## Run & Operate

- `pnpm --filter @workspace/dragonzstore run dev` — run the React/Vite frontend (port 24046)
- `pnpm --filter @workspace/api-server run dev` — run the Express API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 18 + Vite + Tailwind CSS (neon green cyberpunk theme)
- API: Express 5
- DB: SQLite via better-sqlite3 (synchronous, no Drizzle/Postgres)
- Auth: JWT (admin only), validated via bcrypt against admins table, token stored in localStorage
- Payments: NOWPayments API for LTC (mock mode if NOWPAYMENTS_API_KEY not set)
- Email: Nodemailer (order confirmations)
- File uploads: Multer → artifacts/api-server/uploads/

## Where things live

- `artifacts/dragonzstore/` — React/Vite frontend (URL-based routing via wouter)
  - `src/App.tsx` — root with wouter Router/Switch/Route
  - `src/pages/` — Home, Products, ProductDetail, Cart, Checkout, Reviews, Terms, OrderStatus, AdminLogin, AdminDashboard
  - `src/components/` — Navbar, Footer, ProductCard, NetworkBackground
  - `src/lib/api.ts` — axios client + typed API functions
  - `src/lib/cart.tsx` — CartContext (localStorage persistence)
  - `src/index.css` — full cyberpunk theme (neon green = #00ff41)
- `artifacts/api-server/` — Express API server
  - `src/db.ts` — SQLite schema + seed (better-sqlite3, synchronous)
  - `src/routes/` — auth, products, categories, orders, payments, reviews, stock, ltc
  - `src/services/payment.ts` — NOWPayments integration
  - `src/services/email.ts` — Nodemailer order emails
  - `src/middleware/auth.ts` — JWT admin middleware (fails fast in production if JWT_SECRET unset)
  - `data/dragonzstore.db` — SQLite database file (auto-created on startup, gitignored)
  - `uploads/` — product images (served at /uploads, routed via artifact.toml)

## Routes

| URL | Page |
|-----|------|
| `/` | Home (hero, featured products, reviews) |
| `/products` | Product catalog with category filter + search |
| `/products/:id` | Product detail (fetched by ID param) |
| `/cart` | Shopping cart |
| `/checkout` | LTC payment checkout |
| `/reviews` | Customer reviews |
| `/terms` | Terms of service |
| `/status` | Order status lookup |
| `/admin/login` | Admin login |
| `/admin` | Admin dashboard |

## Architecture decisions

- SQLite (better-sqlite3) instead of PostgreSQL — simpler deployment, sufficient for this scale
- URL-based routing via wouter — deep-linkable routes, no prop drilling for navigation
- Admin auth validates password via bcrypt against the `admins` DB table (not plaintext env comparison)
- JWT_SECRET defaults in development; fails fast with process.exit(1) in production if unset
- NOWPayments mock mode — returns a realistic mock LTC payment if no API key is set, enabling full checkout flow testing
- CSS class naming: `gold-text`, `btn-gold`, `input-gold` all map to neon green (#00ff41) — intentional from original migration
- Admin dashboard uses JWT tokens in localStorage (not cookies) — simpler for SPA admin flows
- `/uploads` path added to API server artifact.toml so product images route correctly in production

## Product

- Browse digital products by category (Accounts, Gaming, Tools, Social Media)
- Add items to cart, checkout with LTC (Litecoin) via NOWPayments
- Order status tracking by order ID
- Product reviews system
- Admin dashboard: manage products, categories, stock, pricing, orders

## User preferences

- Neon green cyberpunk theme, dark backgrounds
- URL-based routing via wouter (not state-based, not react-router)
- better-sqlite3 for the database (synchronous SQLite)

## Gotchas

- better-sqlite3 requires native compilation. In this Replit environment, `python312Packages.setuptools` must be installed (already done), then run: `cd /home/runner/workspace/node_modules/.pnpm/better-sqlite3@12.9.0/node_modules/better-sqlite3 && npx node-gyp rebuild`
- API server port is 8080; Vite proxy for `/api` and `/uploads` targets port 8080 (set via `API_PORT` env or the default in vite.config.ts)
- The `init()` call in app.ts runs DB setup + seed synchronously on startup
- SQLite runtime files (`data/*.db`, `data/*.db-shm`, `data/*.db-wal`) are gitignored — do not commit them

## Required Environment Variables

| Variable | Purpose | Default |
|---|---|---|
| `ADMIN_PASSWORD` | Admin login password (bcrypt-hashed on first seed) | `admin123` |
| `ADMIN_EMAIL` | Admin email address | `admin@dragonzstore.com` |
| `JWT_SECRET` | JWT signing secret (required in production) | dev fallback only |
| `LTC_WALLET_ADDRESS` | Your LTC wallet | — |
| `NOWPAYMENTS_API_KEY` | NOWPayments key | mock mode |
| `NOWPAYMENTS_IPN_SECRET` | Webhook secret | — |
| `EMAIL_USER` | SMTP user | — |
| `EMAIL_PASS` | SMTP password | — |

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
