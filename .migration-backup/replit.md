# DragonzStore

A full-stack premium digital products ecommerce store with a luxury black and gold UI.

## Architecture

- **Frontend**: React + Vite + Tailwind CSS + Framer Motion (`/client`, port 5000)
- **Backend**: Node.js + Express.js (`/server`, port 3001)
- **Database**: SQLite (`server/dragonzstore.db`)
- **Auth**: JWT-based admin login
- **Payments**: NOWPayments API (Litecoin/LTC)
- **Email**: Nodemailer (Gmail)

## Running the Project

The single workflow starts both frontend and backend concurrently:
```
npm run dev
```

This runs:
- `node server/index.js` — API on port 3001
- `cd client && npm run dev -- --port 5000` — React app on port 5000 (proxies /api to 3001)

## Admin Access

Default credentials:
- Email: `admin@dragonzstore.com`
- Password: `admin123`

Change these in `.env` before deploying.

## Environment Variables

Copy `.env` and fill in real values:
- `NOWPAYMENTS_API_KEY` — NOWPayments API key for LTC payments
- `NOWPAYMENTS_IPN_SECRET` — Webhook signature secret
- `LTC_WALLET_ADDRESS` — Your LTC wallet address
- `EMAIL_USER` — Gmail address for sending delivery emails
- `EMAIL_PASS` — Gmail App Password (not regular password)
- `JWT_SECRET` — Secret for JWT tokens (change in production!)
- `ADMIN_EMAIL` — Admin login email
- `ADMIN_PASSWORD` — Admin login password
- `BASE_URL` — Server URL for webhooks (e.g. https://yourapp.replit.app)

## User Preferences

- Premium black/gold luxury theme throughout
- All payments via Litecoin (LTC) using NOWPayments
- Auto-delivery via email after payment confirmation
- Mock payment mode available when API key not configured
