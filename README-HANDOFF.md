# FUD frontend rebrand snapshot

This directory contains the standalone frontend prototype currently used for
the FUD rebrand. It is intentionally isolated from the existing V2 app and
backend so the visual system and product flows can be integrated gradually.

## Stack

- React 19
- TanStack Start / TanStack Router
- Vite 8
- Tailwind CSS 4
- Radix UI

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

This snapshot is frontend-only. Do not wire it to production services or
replace the V2 root app wholesale; move features into V2 incrementally after
the intended behavior and data contracts are agreed.
