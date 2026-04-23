# Axon — Transparent résumé screening

A hiring pipeline you can *explain*. Every candidate runs through a visible graph — rubric per criterion, evidence per score, signed audit record per decision.

> **Status:** M2 — node kinds, config panel, interactive onboarding. Live at **[axon.raymnz.com](https://axon.raymnz.com)**.
> Built for NYC Local Law 144 and the EU AI Act.

## Why
Every modern ATS now includes LLM scoring — and it's all opaque. With NYC Local Law 144 and the EU AI Act landing, opacity is a liability, not a feature. Axon flips it: the pipeline IS the audit.

## Stack
Next 16 · React 19 · Tailwind 4 · `@xyflow/react` · `framer-motion` · Instrument Serif + Geist · Cloudflare Workers + Static Assets · Gemini 2.5.

## Develop
```bash
pnpm install
pnpm dev
```

## Deploy
```bash
pnpm cf:deploy   # next build && wrangler deploy
```

See `BRIEF.md` for the full product spec, market rationale, and milestone plan.
