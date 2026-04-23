# Axon — Transparent résumé screening

> **Name:** `axon` · **Live:** [axon.raymnz.com](https://axon.raymnz.com) · **Mode:** single-user pilot

## One-liner
A hiring pipeline you can *explain*. Axon screens candidates through a visible graph — rubric per criterion, evidence per score, signed audit record per decision. Built for NYC Local Law 144 and the EU AI Act.

## Why this exists
AI is already screening the world's résumés. The ATSs (Greenhouse, Lever, Ashby, Workday) and specialist screeners (Eightfold, HireVue, Paradox) all bolt on LLM-powered scoring — and it's all a **black box**. Recruiters can't explain why a candidate was rejected. Hiring managers can't tune the rubric. Legal can't audit the reasoning. And the regulators have arrived:

- **NYC Local Law 144** (enforceable since July 2023) — any automated employment decision tool used to screen NYC candidates must undergo an annual **bias audit** by an independent auditor.
- **EU AI Act Article 6** (Annex III classifies hiring AI as "high-risk"; obligations phased in through 2026) — requires record-keeping, transparency, human oversight, and explainability for any AI touching employment decisions.
- **Illinois AI Video Interview Act · Maryland HB 1202 · Colorado SB 205** — similar regimes.

The incumbents' response is compliance theater: a PDF audit, a disclaimer, an opaque model. The moat for a new entrant is **auditability as a first-class product feature, not a report generated after the fact.**

## Product shape
Every pipeline is a React Flow graph. Every run produces a signed, immutable audit record containing:
- pipeline version (hashed graph + rubric prompts)
- per-node scores with verbatim evidence snippets from the résumé
- branching decisions (which route was taken and why)
- human reviewer (if any) and their override
- timestamp and candidate identifier

**The pipeline is the audit.** The recruiter doesn't have to explain the AI — the recruiter shows the pipeline.

## Target customer
- **Buyer:** Head of Talent Acquisition at 200–2,000 employee company OR founder at a TA-tech startup.
- **User:** Recruiter, hiring manager, TA operations lead.
- **Regulatory pull:** NYC-based or EU-facing hiring teams feeling the audit pressure now. Series-B+ SaaS companies planning 50+ hires/year.

## Differentiation
| | Black-box screeners | Axon |
|---|---|---|
| Why rejected? | "Our model scored you low." | "Rubric v12 scored 2/5 on backend (evidence: X, Y). Fit gate routed to hold." |
| Audit prep | Generate PDF after the fact | Every run IS an audit record |
| Rubric changes | Engineering ticket | Non-technical user edits the prompt |
| A/B a rubric | Impossible | Pipeline versioning built in |
| Bias review | Outsourced to auditor | Visible exclusion clauses in every rubric |

## MVP (pilot) scope
**In**
- Visual canvas with 5 node kinds: **Candidate in** (Trigger), **Parse / Enrich** (Tool), **Score** (LLM with rubric), **Fit gate** (Route), **Decision** (Reply)
- Per-Score rubric prompt with explicit demographic-exclusion scaffolding
- Pipeline versioning (graph hash) — future-proof for audit diff
- Save/load pipelines · CRUD workflows (M3)
- Run a pipeline against a sample résumé; stream node-level evidence live (M4-M5)
- Run history table → replay any past run on the canvas with timing (M7)
- Signed audit log export (CSV/JSON) with rubric version + evidence chain

**Out (v2+)**
- Real ATS integrations (Greenhouse, Lever webhooks)
- Bulk re-score on rubric change
- Bias metrics dashboard (adverse impact ratio per group, when protected-class data available)
- Team accounts / reviewer queues / RBAC
- Self-serve export to ATS

## Narrative demo (what a recruiter sees, 90 sec)
1. Open Axon → "Senior backend engineer · screening" pipeline prewired.
2. Click **Score: Backend experience** → right panel shows the rubric. Edit it: require 5+ years and on-call experience. Save.
3. Click **+ Score** on palette → drag onto canvas. Rename: "Score: System design depth." Edit rubric.
4. Wire it: Parse → new Score → Fit gate.
5. Drop a sample résumé onto the Candidate-in node.
6. The canvas lights up: parse → score-backend (evidence streams in) → score-system-design (same) → fit gate routes to "advance" → decision writes audit record.
7. Click the decision node: full audit trail renders with rubric version hash, per-node evidence, timestamp.

## Stack (unchanged from scaffold)
| Layer | Choice | Why |
|---|---|---|
| Framework | Next 16 (App Router) + static export | Frontend is client-heavy canvas; no SSR needed |
| Canvas | `@xyflow/react` 12 | Central to the product, not decoration |
| Motion | `framer-motion` | Interactive onboarding + streaming evidence reveal |
| Styling | Tailwind 4 + editorial palette (paper, ink, terracotta) | Anthropic-inspired; avoids "AI slop" aesthetic |
| Fonts | Instrument Serif (display) + Geist Sans/Mono | Serif italic for brand moments, mono for rubric versions |
| Frontend deploy | Cloudflare Workers + Static Assets | Simple; no SSR worker |
| Exec engine | Separate Cloudflare Worker (M4) | POST /run · SSE stream back to canvas |
| Store | D1 (pipelines, runs, run_events) · R2 (résumé PDFs) · KV (session) | All edge-native |
| LLM | Gemini 2.5 Flash default / Pro for heavier rubrics | Already wired |
| Auth | Single-user pilot → magic-link (post-M9) | Ships first |
| Deploy URL | `axon.raymnz.com` | Custom domain already bound |

## Data model
```
pipelines(id, name, graph_json, graph_hash, created_at, updated_at)
pipeline_versions(id, pipeline_id, graph_json, graph_hash, created_at)
candidates(id, name, resume_pdf_r2_key, metadata_json, created_at)
runs(id, pipeline_version_id, candidate_id, status, started_at, finished_at,
     final_decision, reviewer_id)
run_events(id, run_id, node_id, type, data_json, ts)  -- type: started|score|evidence|route|finished|error
```

## Milestones (updated to product framing)
1. **M1 — Scaffold + canvas stub.** ✅ Shipped.
2. **M2 — Node kinds + config panel + interactive onboarding.** ✅ Shipped.
3. **M3 — Save/load pipelines (D1).** CRUD + versioning on save.
4. **M4 — Execution engine.** Separate Worker `/run`, topological sort, Gemini call per Score node with rubric, evidence extraction, SSE per-event stream.
5. **M5 — Live canvas execution.** Evidence snippets stream into Score nodes, edge glow on active branch, status halo per node, final decision animates in.
6. **M6 — Fit gate routing + sample-candidate runner.** Route node picks branch based on upstream scores; a sample-résumé upload widget lets you run without ATS integration.
7. **M7 — Run history + audit replay.** Runs table, click → load pipeline AT THAT VERSION, replay events with timing scrubber. This IS the audit surface.
8. **M8 — Polish pass.** Signature animations dialed, empty states, sharable view-only audit URL.
9. **M9 — README + hero demo.** Portfolio README with market pitch, hero GIF (90-sec demo above), architecture diagram, "try it yourself" with seeded sample candidate.

## Open questions (not blocking M3)
- Exact export format for audit records (CSV? PDF? both? signed with what?)
- How aggressive to be about demographic-signal exclusion — hard stops or warnings?
- Rubric templates per role family (backend, frontend, PM, designer) as a seeded library?
