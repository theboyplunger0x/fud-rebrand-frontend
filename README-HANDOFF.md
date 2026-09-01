# FUD frontend rebrand snapshot

This directory contains the standalone frontend prototype currently used for
the FUD rebrand. It remains isolated from the existing V2 app so the visual
system and product flows can be integrated gradually.

## Stack

- React 19
- TanStack Start / TanStack Router
- Vite 8
- Tailwind CSS 4
- Radix UI
- Privy authentication

## Run locally

```bash
cd frontend-rebrand
npm install
npm run dev -- --port 8092
```

Build and lint checks:

```bash
npm run build
npm run lint
```

## Current scope

- FUD landing and app shell visual direction
- Market cards and market detail prototype
- Personal portfolio/profile prototype
- Public user profiles with follow state and follower counts
- Market opener identity and messages in the Markets tab
- FUD icons, social card, and glossy 3D brand assets
- Real sign-in, profile picture and bio editing through the beta backend
- Canonical USDC balance from `users.balance_usd`
- Verified FUDP balance from the existing Season wallet link

Markets, positions and trading remain prototype data. Do not replace the V2
root app wholesale or connect those flows implicitly.

## V2 backend boundary

V2 is a new market/trading domain under `backend/src/v2`, but it intentionally
reuses the canonical `users` identity. The rebrand currently connects only to
that shared core:

- `POST /api/users/bootstrap` for Privy login
- `GET /auth/me` and `POST /auth/update-profile` for identity, PFP and bio
- `GET /season/me` for the verified FUDP balance

Local development proxies `/api-backend` to the isolated Railway backend used
by the beta deployment to avoid browser CORS issues. Production builds require
`VITE_API_URL`; there is no implicit production fallback. Never make
browser-read token balances the canonical FUDP source; the existing server-side
verified link remains the source of truth.
