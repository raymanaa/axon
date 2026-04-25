# Axon

**Transparent résumé screening.** A hiring pipeline you can *explain* — rubric per criterion, verbatim evidence per score, signed audit record per decision. Built for NYC Local Law 144 and the EU AI Act.

- **Live:** [axon.raymnz.com](https://axon.raymnz.com)
- **Status:** M1 → M9 complete (portfolio pilot, alpha)
- **Stack:** Next 16 · React 19 · Tailwind 4 · `@xyflow/react` · `framer-motion` · Gemini 2.5 · Cloudflare Workers + Static Assets

---

## Why this exists

AI is already screening the world's résumés — every major ATS (Greenhouse, Lever, Ashby, Workday) and specialist (Eightfold, HireVue) layers LLM scoring on top of matching. All of it is a **black box**. Recruiters can't explain why a candidate was rejected; hiring managers can't tune rubrics; legal can't audit the reasoning.

Meanwhile, the regulators have arrived:

| Jurisdiction | Rule | Status |
|---|---|---|
| NYC | Local Law 144 — annual bias audit of AEDTs | Enforced July 2023 |
| EU | AI Act Art. 6 + Annex III — hiring AI is "high-risk" | Phased enforcement through 2026 |
| Illinois | AI Video Interview Act — consent + disclosure | In force |
| Maryland | HB 1202 — facial recognition consent | In force |
| Colorado | SB 205 — duty of care + impact assessments | Feb 2026 |

Axon's wedge: **the pipeline IS the audit.** Not a PDF generated after the fact — a live, inspectable, append-only record that maps every decision back to the exact rubric version that produced it.

---

## What it does

Four surfaces per open role:

### Candidates
A table of every applicant with their per-criterion scores and pipeline status. Click a row → detail panel:

- Résumé summary
- Score cards with **verbatim evidence snippets** for each criterion (no paraphrasing; quotes must come from the résumé)
- **Re-score with Gemini** button that streams live: tokens arrive progressively, evidence lines fade in as the model identifies them, score animates on completion
- Pipeline recommendation from the Fit gate (Gemini-reasoned advance/hold/reject with cited scores)
- Reviewer override buttons (decisions are distinct from pipeline recommendations in the audit log)
- **Share audit receipt** — generates a URL that encodes the full trail; anyone visiting sees a polished read-only report

### Criteria
Form cards, not prompt textareas. Each criterion has:
- Inline-editable name
- Type (experience · skill · education · communication · fit)
- **Strictness slider** (1–5: open → very strict) with per-level hint
- "What great looks like" plain-English description
- **Ignore when scoring** chips (school prestige, age, location, etc.) — visible in the audit log

Editing creates a new pipeline version; past candidates stay linked to the rubric that scored them.

### Pipeline
The underlying graph, rendered on a React Flow canvas: `Candidate in → Parse résumé → Score criteria → Fit gate → Commit decision`. Used by compliance/legal/hiring-manager audits. Most recruiters never open this tab.

### Audit
The append-only log of everything that's happened: fit-gate recommendations, rescore events, reviewer overrides. Filter by kind, search by candidate, **export JSON** for a real bias audit submission.

---

## Architecture

```
                            ┌─────────────────────────────────────┐
   browser                  │      Cloudflare Worker (edge)       │
   ───────                  │                                     │
                            │   /api/score                        │
   Next 16 static export ── ├─► /api/score-stream ─ Gemini ──┐    │
   (out/ → ASSETS)          │   /api/decide                  │    │
                            │                                │    │
                            │   Everything else → ASSETS ────┘    │
                            └─────────────────────────────────────┘
                                          │
                               axon.raymnz.com (custom domain)

   persistence (pilot):
   localStorage {
     axon.decisions.v1    — status overrides map
     axon.scores.v1       — rescored scores per (candidate, criterion)
     axon.fitgate.v1      — pipeline recommendations
     axon.audit.v2        — append-only log (discriminated union)
   }

   production path:   D1 tables back the same shapes; the client fetches
                      against /api/* instead of reading localStorage.
```

Pages (all statically exported, served from ASSETS):

- `/` — landing
- `/app` — console (candidate inbox, tabs, detail panel)
- `/security` — architecture explainer with sticky TOC
- `/compliance` — law cards for NYC / EU / IL / MD / CO
- `/audit` — public audit receipt, reads `?c=<base64>` via `useSearchParams` inside `<Suspense>`

---

## Demo walkthrough (90 seconds)

1. Open [axon.raymnz.com](https://axon.raymnz.com) → marketing landing page.
2. Click **Open the console** → `/app`. Onboarding walks through selecting a candidate, reviewing evidence, and switching to Criteria.
3. Open **Maya Chen**. See her scores, evidence quotes, pipeline status.
4. Click **Re-score with Gemini**. Per-criterion cards light up; partial evidence streams into each card as the model reads her résumé. Scores update with a spring animation. The Fit gate fires and produces a recommendation with cited reasoning.
5. Override her decision manually. The audit log now has 3 rescore entries + 1 fit-gate entry + 1 override entry for her alone.
6. Click the **share link** icon in her panel → copy the URL. Open in incognito → see the full signed receipt at `/audit?c=…` rendered as a public report.
7. Switch to the **Audit** tab → filter by "Fit gate" → export JSON.

---

## Pipeline versioning mechanics

Every criterion edit mutates the pipeline and creates a new version. The version is a hash of the graph + rubric prompts (`v12 · 3a7f9c2` in the pilot, fixed for now; production hashes on every save). Candidates scored under version *N* stay permanently linked to *N*, even after edits. Re-scoring a candidate under a new version writes a new audit event; it does not overwrite the old record. This makes historical bias audits verifiable.

Every decision record contains:
- `candidate_id` · `pipeline_version_id`
- per-criterion scores with evidence
- pipeline recommendation + reviewer override
- reviewer id + timestamp

The receipt URL encodes this slice; the audit tab renders and exports the aggregate.

---

## Demographic-signal exclusions

Every scoring prompt is assembled with an explicit **do-not-consider** list per criterion:

- Default: name, age, location, school, gender
- Criterion-specific additions surface in the Criteria UI and the audit log

Example: a Communication criterion additionally excludes "native-English fluency" and "school prestige." These exclusions are visible to reviewers, embedded in the prompt, and recorded per run.

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next 16 (App Router, static export) | Multi-page site, SSR not needed |
| React | 19 | latest stable |
| Styling | Tailwind 4 (paper palette) | warm "editorial SaaS" feel |
| Type | Inter Variable + JetBrains Mono | Linear-adjacent, distinct from Geist everywhere |
| Canvas | `@xyflow/react` 12 | used only on the Pipeline tab (audit story) |
| Motion | `framer-motion` 12 | streaming UI polish |
| Icons | `lucide-react` | |
| Deploy | Cloudflare Workers + Static Assets | one worker handles `/api/*`, falls through to assets |
| LLM | Gemini 2.5 Flash (default), 2.5 Pro option | already provisioned |
| Persistence | localStorage (pilot) → D1 (production, see /security) |

---

## What's next (post-pilot)

- D1 persistence swap (token scope currently missing D1; architecture documented on `/security`)
- ATS integration (Greenhouse/Lever webhooks — trigger a run on new application)
- Team accounts + reviewer queues
- Bulk re-score on rubric change
- Bias metrics dashboard (adverse impact ratio per declared group, when protected-class data available)
- Magic-link auth (current pilot is single-user)

See [`BRIEF.md`](./BRIEF.md) for full market rationale, competitive positioning, and milestone plan.

---

## Develop locally

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm cf:deploy    # next build && wrangler deploy
```

Requires:
- Node 22, pnpm 10
- Cloudflare account with Workers + a zone you control
- Gemini API key set as a Worker secret:
  ```bash
  npx wrangler secret put GEMINI_API_KEY
  ```

---

## Shipped milestones

| | | |
|---|---|---|
| M1 | ✅ | Scaffold + canvas stub + custom domain |
| M2 | ✅ | Node types + interactive onboarding |
| M3 | ✅ | Landing + `/security` + `/compliance` + localStorage persistence + audit log UI |
| M4 | ✅ | `/api/score` — Gemini with rubric + evidence + exclusions |
| M5 | ✅ | `/api/score-stream` — token streaming, live thinking UI |
| M6 | ✅ | `/api/decide` — Fit gate, Gemini-reasoned pipeline recommendation |
| M7 | ✅ | Audit tab — filtered log + JSON export |
| M8 | ✅ | `/audit?c=…` — public audit receipt URL + share popover |
| M9 | ✅ | This README + architecture diagram |

---

Built by [Rayen Manaa](https://github.com/raymanaa) as portfolio project #1. Axon is a pilot; not legal advice; not a production product. But the mechanics are real.
