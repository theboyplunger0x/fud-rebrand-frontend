# FUD front — UI scope

This repo is the FUD frontend (design + UI work). The source of truth is here, not
Lovable. Lovable is a sketchpad: what you like, you bring here, and from then on it
gets edited here.

## You can touch freely
- components, pages, layout, styles
- responsive / mobile
- UX states (loading, empty, error, pending, etc.)
- copy / microcopy

## Ask Marcos before touching
- product mechanics (timeframes, fee, up/down logic)
- auth / wallet / connect flows
- anything that changes how numbers or outcomes are computed

## Workflow
- branch from main (for example `ui/<your-name>`)
- push your branch, open a PR
- review happens on the Vercel preview, then Marcos merges
- do NOT push directly to main (it is protected)

## Run it locally
```
bun install
bun dev    # http://localhost:8080
```
Theme toggle (sun/moon) is in the header: light is the socio's look, dark is FUD's
near-black + emerald identity.
