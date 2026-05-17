# Deployment Guide - HabitForge

This project is a monorepo with a Node.js/Express server and a Vite/React client. The server serves the built client as static files in production.

## Prerequisites

1. **Render Account** (or any Node.js hosting platform).
2. **Node.js >= 18** installed locally.

## Environment Variables

Create a `.env` file in the `server/` directory for local development:

```env
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

For production, set these in your hosting platform (e.g., Render):

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port (Render sets this automatically) | `10000` |
| `NODE_ENV` | Environment mode | `production` |
| `CORS_ORIGIN` | Allowed CORS origin | `https://your-app.onrender.com` |

> **Note:** Render automatically sets `PORT`. Your `server/src/index.ts` reads `process.env.PORT` to bind to the correct port.

## Deployment Steps (Render)

### Step 1: Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **Web Service**.
3. Connect your GitHub/GitLab repository.

### Step 2: Configure Build & Start

| Field | Value |
|-------|-------|
| Name | `habitforge` (or your preference) |
| Environment | `Node` |
| Branch | `main` |
| Build Command | `cd client && npm install && npm run build && cd ../server && npm install && npm run build` |
| Start Command | `cd server && npm start` |

### Step 3: Add Environment Variables

Add these in the **Environment** tab:

- `NODE_ENV`: `production`
- `CORS_ORIGIN`: Your Render domain (e.g., `https://habitforge.onrender.com`)

### Step 4: Deploy

1. Click **Create Web Service**.
2. Render will build and deploy your app automatically.

## How It Works

- **Root `package.json`**: Coordinates the overall build process.
- **Server**: Builds `server/` and starts `dist/index.js`.
- **Client**: Built to `client/dist/` and served as static files by the Express server.
- **All API calls** use relative paths (`/api/...`), so they work in both dev and production.

## Health Checks

- **Server health**: `GET /health` returns `{ status: "OK", timestamp, uptime }`.
- **Database health**: Check the Render logs for `Connected to PostgreSQL`.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Build failed` on Render | Check that `client/` and `server/` both have `package.json` with correct dependencies |
| `Blank page after deployment` | Ensure the server is correctly serving `client/dist/index.html` for all non-API routes |
| `CORS errors` | Check `CORS_ORIGIN` matches your actual domain |

## Scripts Reference

```bash
# Root (installs all deps)
npm run install-all

# Development (run in separate terminals)
cd server && npm run dev    # Backend on port 5000
cd client && npm run dev    # Frontend on port 5173

# Production build
cd client && npm run build
cd server && npm run build && npm start
```

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Framer Motion, Recharts, Lucide React
- **Backend**: Node.js, Express, TypeScript, Ethers.js
- **Database**: Smart Contracts on Hardhat Local Blockchain
- **Deployment**: Render (or any Node.js hosting)
