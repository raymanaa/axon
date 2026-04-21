# Axon — Agent Workflow Builder

> Name: `axon`. Subdomain: `axon.raymnz.com`. Mode: single-user pilot (no auth).

## One-liner
Visual, node-based canvas where you compose multi-step AI agents out of LLM calls, tool calls, branches, and loops — then run them with live streaming logs per node.

## Why it's a portfolio piece
- **React Flow is the protagonist.** Not a bolt-on. Every core interaction lives on the canvas.
- **AI-SaaS on the nose.** LLM routing, tool use, cost/latency telemetry per node.
- **UX showcase.** Microinteractions at every affordance: node spawn (spring-in), edge draw (path morph), run (traveling gradient along active edges), per-node streaming tokens, completion pulse.
- **Demo-able in 30 seconds.** Open canvas → drop 3 nodes → connect → click Run → tokens stream into the node bodies → total cost/latency pill animates in.

## Scope (MVP — pilot)
**In**
- Canvas with 5 node types: `Trigger`, `LLM`, `Tool (web.fetch | http)`, `Route`, `Reply`.
- Drag from palette, snap-to-grid, auto-layout (ELK) button, minimap, zoom-to-fit.
- Per-node config panel (model, prompt template with `{{var}}` interpolation, tool params).
- Execution engine on Workers: topological run, SSE stream of per-node events (`started`, `token`, `finished`, `error`), cost+latency accounting.
- Run history table (D1), click a run → canvas replays with timing.
- Save/load workflows (D1), shareable view-only URL (`/w/:id`).
- Auth: passwordless email magic link (CF Workers + KV) OR single-user mode for v1. **Default to single-user for pilot speed.**

**Out (v2+)**
- Team accounts, RBAC, API keys per user.
- Node marketplace / custom nodes.
- Triggers beyond manual (webhook, cron).
- Vector/embedding nodes.
- Non-Gemini providers.

## Signature animations (the polish bar)
1. **Edge runtime glow** — while a node runs, its outgoing edges animate a gradient pulse toward downstream nodes. `requestAnimationFrame` + SVG `stroke-dashoffset`.
2. **Token stream inside node** — LLM nodes show streaming tokens inside the node body with a cursor blink, width auto-grows with spring physics (framer-motion `layout`).
3. **Node status halo** — idle (none), queued (breathing ring), running (rotating conic gradient), done (green pulse then fade), error (red shake).
4. **Palette drag preview** — dragging a palette item shows a translucent ghost that snaps into the canvas with a small "drop" spring.
5. **Run summary pill** — bottom-center pill with total latency + cost that morphs in on completion.

## Stack
| Layer | Choice | Why |
|---|---|---|
| Framework | Next 15 (App Router) on **Cloudflare Pages** | SSR + edge, lets Workers API colocate |
| Canvas | `@xyflow/react` (React Flow 12) | Industry standard; custom node support |
| Motion | `framer-motion` | Springs + `layout` animations |
| Layout | `elkjs` | Auto-arrange button |
| Styling | Tailwind + `shadcn/ui` | Speed + consistent primitives |
| Exec API | Cloudflare Workers (separate Worker) | Long-running, streams SSE |
| State | **D1** (workflows, runs, run_events) + **KV** (session) | Cheap, edge |
| LLM | Gemini 2.5 Flash (default) / 2.5 Pro (per-node override) | Already provisioned |
| Auth (pilot) | None / single-user token in KV | Ship fast |
| Deploy | Next on CF via `@opennextjs/cloudflare` (Workers + static assets); domain `axon.raymnz.com` | Existing zone |

## Data model (v1)
```
workflows(id, name, graph_json, created_at, updated_at)
runs(id, workflow_id, status, started_at, finished_at, total_tokens, total_cost_usd)
run_events(id, run_id, node_id, type, data_json, ts)   -- type: started|token|finished|error
```

## Milestones
1. **M1 — Scaffold + canvas stub.** Repo, deploy pipeline, empty canvas renders with one dummy node. Deployed at `axon.raymnz.com`.
2. **M2 — Node types + config panel.** 5 node types render, palette drag works, config panel bound to node data.
3. **M3 — Save/load.** D1 schema, workflows CRUD API, canvas persists.
4. **M4 — Execution engine.** Workers endpoint `/run`, topological execution of a linear graph, Gemini call, cost accounting.
5. **M5 — Streaming + live UI.** SSE from Worker, token streaming into nodes, edge glow, status halo.
6. **M6 — Routing + loops.** `Route` node (LLM-powered classification), handle branches, cycle detection.
7. **M7 — Run history + replay.** Runs table, click → canvas replay with timing scrubber.
8. **M8 — Polish pass.** All 5 signature animations dialed, empty states, error states, shareable view-only URL.
9. **M9 — README + demo GIF.** Portfolio-facing README with hero GIF, architecture diagram, "try it" CTA.

## Decisions locked
- Name: **axon**
- Subdomain: **axon.raymnz.com** (zone `249a7fb8948a8aa44b2d2202d7483e50`)
- Auth: **none** (single-user pilot)
- Stack: **Next 15 + @opennextjs/cloudflare** on Workers

## Still open
- Hero demo content (default: "summarize latest HN top 5" as canned example)
