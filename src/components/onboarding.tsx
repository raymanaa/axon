"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const STORAGE_KEY = "axon.onboarding.dismissed.v3";

export type OnboardingObs = {
  selectedId: string | null;
  scorePromptEdited: boolean;
  userAddedCount: number;
  userAddedLLM: boolean;
  userEdgesOnNew: boolean;
};

type Placement = "above" | "below" | "left" | "right" | "center";

type Step = {
  id: string;
  selector: string | null;
  placement: Placement;
  eyebrow: string;
  title: string;
  italicSpan?: string;
  body: string;
  callout?: string;
  cta?: string;
  isDone?: (obs: OnboardingObs) => boolean;
};

const STEPS: Step[] = [
  {
    id: "welcome",
    selector: null,
    placement: "center",
    eyebrow: "Welcome",
    title: "Hiring you can",
    italicSpan: "explain.",
    body: "Axon runs every candidate through a pipeline you can see — a rubric for each criterion, evidence for every score, a visible audit trail from application to decision. Four moves and you'll know how to drive it.",
    callout: "Built for NYC Local Law 144 · EU AI Act Article 6",
    cta: "Begin the tour",
  },
  {
    id: "click-score",
    selector: '[data-id="n3"]',
    placement: "below",
    eyebrow: "Step 1 of 4",
    title: "Click the",
    italicSpan: "Score",
    body: "This node scores each candidate on backend experience. Selecting it opens the rubric on the right. Every score node is a decision the auditor will inspect — they exist separately on purpose.",
    isDone: (o) => o.selectedId === "n3",
  },
  {
    id: "edit-prompt",
    selector: '[data-onboarding-target="prompt-input"]',
    placement: "left",
    eyebrow: "Step 2 of 4",
    title: "The rubric",
    italicSpan: "is",
    body: "The prompt. Tweak it — set stricter thresholds, require specific evidence, exclude demographic signals. Each edit becomes a new pipeline version, so past decisions stay linked to the rubric that produced them.",
    isDone: (o) => o.scorePromptEdited,
  },
  {
    id: "add-node",
    selector: '[data-onboarding-target="palette-llm"]',
    placement: "right",
    eyebrow: "Step 3 of 4",
    title: "Add another",
    italicSpan: "criterion.",
    body: "Drag a Score node from the palette onto the canvas. You might score on communication, system-design depth, or a role-specific skill — whatever the hiring manager actually cares about.",
    isDone: (o) => o.userAddedLLM,
  },
  {
    id: "connect",
    selector: null,
    placement: "center",
    eyebrow: "Step 4 of 4",
    title: "Wire it into",
    italicSpan: "the pipeline.",
    body: "Drag from one of the small dots on the Parse résumé node to your new Score node, then from that to the Fit gate. Every edge is part of the audit record.",
    isDone: (o) => o.userEdgesOnNew,
  },
  {
    id: "done",
    selector: null,
    placement: "center",
    eyebrow: "You're set",
    title: "Now you can",
    italicSpan: "ship it.",
    body: "Running this pipeline against real candidates arrives next — each run will stream live on the canvas and produce a signed audit record with rubric version, evidence, and reviewer. For now, explore.",
    cta: "Start building",
  },
];

export function Onboarding({ obs }: { obs: OnboardingObs }) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [completed, setCompleted] = useState(false);
  const pendingAdvance = useRef<ReturnType<typeof setTimeout> | null>(null);

  const step = STEPS[idx];

  // Show on first visit
  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = window.localStorage.getItem(STORAGE_KEY) === "1";
    if (!dismissed) setOpen(true);
  }, []);

  // Auto-advance when step's isDone observes truth
  useEffect(() => {
    if (!open) return;
    const s = STEPS[idx];
    if (!s.isDone) return;
    if (s.isDone(obs) && !completed) {
      setCompleted(true);
      if (pendingAdvance.current) clearTimeout(pendingAdvance.current);
      pendingAdvance.current = setTimeout(() => {
        setCompleted(false);
        advance();
      }, 620);
    }
    return () => {
      if (pendingAdvance.current) clearTimeout(pendingAdvance.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, idx, obs]);

  // Keyboard: Esc to dismiss entirely; → to force-advance on CTA steps only
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
      if ((e.key === "Enter" || e.key === "ArrowRight") && step.cta) advance();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, idx]);

  function advance() {
    if (idx < STEPS.length - 1) setIdx((i) => i + 1);
    else dismiss();
  }

  function dismiss() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "1");
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="onboarding"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 pointer-events-none"
      >
        <Spotlight selector={step.selector} />
        <Callout
          step={step}
          idx={idx}
          total={STEPS.length}
          completed={completed}
          onNext={advance}
          onSkip={dismiss}
        />
      </motion.div>
    </AnimatePresence>
  );
}

/* ---------- Spotlight ---------- */

function useTargetRect(selector: string | null) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useLayoutEffect(() => {
    if (!selector) {
      setRect(null);
      return;
    }
    let raf = 0;
    const tick = () => {
      const el = document.querySelector(selector);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect((prev) => {
          if (!prev) return r;
          if (
            Math.abs(prev.x - r.x) < 0.5 &&
            Math.abs(prev.y - r.y) < 0.5 &&
            Math.abs(prev.width - r.width) < 0.5 &&
            Math.abs(prev.height - r.height) < 0.5
          ) {
            return prev;
          }
          return r;
        });
      } else {
        setRect(null);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [selector]);

  return rect;
}

function Spotlight({ selector }: { selector: string | null }) {
  const rect = useTargetRect(selector);
  const pad = 10;
  const maskId = "axon-ob-spot";

  return (
    <svg
      className="absolute inset-0 pointer-events-none h-full w-full"
      aria-hidden
    >
      <defs>
        <mask id={maskId}>
          <rect width="100%" height="100%" fill="white" />
          {rect && (
            <motion.rect
              initial={false}
              animate={{
                x: rect.x - pad,
                y: rect.y - pad,
                width: rect.width + pad * 2,
                height: rect.height + pad * 2,
              }}
              transition={{ duration: 0.22, ease: [0.2, 0, 0.2, 1] }}
              rx={12}
              fill="black"
            />
          )}
        </mask>
      </defs>
      <motion.rect
        width="100%"
        height="100%"
        fill="rgba(24, 23, 21, 0.36)"
        mask={`url(#${maskId})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      {rect && (
        <motion.rect
          initial={false}
          animate={{
            x: rect.x - pad,
            y: rect.y - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
          }}
          transition={{ duration: 0.22, ease: [0.2, 0, 0.2, 1] }}
          rx={12}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={1.5}
          strokeDasharray="6 5"
          strokeOpacity={0.85}
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="-22"
            dur="1.4s"
            repeatCount="indefinite"
          />
        </motion.rect>
      )}
    </svg>
  );
}

/* ---------- Callout ---------- */

function Callout({
  step,
  idx,
  total,
  completed,
  onNext,
  onSkip,
}: {
  step: Step;
  idx: number;
  total: number;
  completed: boolean;
  onNext: () => void;
  onSkip: () => void;
}) {
  const rect = useTargetRect(step.selector);
  const style = calloutStyle(rect, step.placement);

  return (
    <motion.div
      key={step.id}
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      transition={{ duration: 0.24, ease: [0.2, 0, 0.2, 1] }}
      style={style}
      className="pointer-events-auto fixed w-[420px] max-w-[calc(100vw-32px)] rounded-xl border border-line bg-card shadow-[0_18px_48px_rgba(24,23,21,0.18)]"
    >
      <div className="px-6 pt-5 pb-5">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="block h-[9px] w-[9px] rounded-sm bg-[color:var(--accent)]"
          />
          <span className="text-[10.5px] font-mono uppercase tracking-[0.2em] text-ink-2">
            {step.eyebrow}
          </span>
        </div>

        <h2 className="serif mt-4 text-[28px] leading-[1.1] tracking-[-0.015em] text-ink">
          {step.title}
          {step.italicSpan && (
            <>
              {" "}
              <span className="serif-italic">{step.italicSpan}</span>
            </>
          )}
        </h2>

        <p className="mt-3 text-[13.5px] leading-[1.65] text-ink-2">
          {step.body}
        </p>

        {step.callout && (
          <div className="mt-3.5 rounded-md border border-line bg-paper px-3 py-2 font-mono text-[11.5px] text-ink-2">
            {step.callout}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
        <StepDots idx={idx} total={total} />

        <div className="flex items-center gap-1">
          {step.isDone ? (
            completed ? (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 rounded-md bg-[color:var(--accent-soft)] px-2.5 py-1.5 text-[12px] font-medium text-[color:var(--accent)]"
              >
                <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
                <span>Nice.</span>
              </motion.span>
            ) : (
              <span className="flex items-center gap-1.5 px-1 py-1 text-[11.5px] text-ink-3">
                <PulseDot />
                <span>waiting for you…</span>
              </span>
            )
          ) : (
            <button
              onClick={onNext}
              className="group flex items-center gap-1.5 rounded-md bg-ink px-3.5 py-1.5 text-[12.5px] font-medium text-paper hover:bg-[color:var(--ink-2)] transition-colors"
            >
              {idx === 0 && <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />}
              <span>{step.cta}</span>
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </button>
          )}

          <button
            onClick={onSkip}
            className="px-2.5 py-1.5 text-[11.5px] text-ink-3 hover:text-ink transition-colors"
          >
            {idx === STEPS.length - 1 ? "Close" : "Skip"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function StepDots({ idx, total }: { idx: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={[
            "h-1.5 rounded-full transition-all",
            i === idx
              ? "w-5 bg-ink"
              : i < idx
                ? "w-1.5 bg-ink-2"
                : "w-1.5 bg-line-2",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

function PulseDot() {
  return (
    <span className="relative inline-block h-1.5 w-1.5">
      <span className="absolute inset-0 rounded-full bg-ink-3" />
      <motion.span
        className="absolute inset-0 rounded-full bg-ink-3"
        animate={{ scale: [1, 2.2, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
      />
    </span>
  );
}

/* ---------- Positioning ---------- */

function calloutStyle(
  rect: DOMRect | null,
  placement: Placement,
): React.CSSProperties {
  const calloutW = 420;
  const pad = 20;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1400;
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;

  const centered: React.CSSProperties = {
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  };

  if (!rect || placement === "center") return centered;

  // Clamp helpers
  const clampLeft = (x: number) =>
    Math.max(16, Math.min(x, vw - calloutW - 16));

  if (placement === "above") {
    const left = clampLeft(rect.x + rect.width / 2 - calloutW / 2);
    const top = Math.max(16, rect.y - pad);
    // If target is too close to top, flip to below
    if (top < 160) {
      return {
        top: Math.min(rect.y + rect.height + pad, vh - 280),
        left,
      };
    }
    return { top, left, transform: "translate(0, -100%)" };
  }
  if (placement === "below") {
    const left = clampLeft(rect.x + rect.width / 2 - calloutW / 2);
    const top = Math.min(rect.y + rect.height + pad, vh - 260);
    return { top, left };
  }
  if (placement === "left") {
    const left = rect.x - pad;
    // If no room, flip right
    if (left < calloutW + 24) {
      return {
        top: clampY(rect.y + rect.height / 2, vh),
        left: rect.x + rect.width + pad,
        transform: "translate(0, -50%)",
      };
    }
    return {
      top: clampY(rect.y + rect.height / 2, vh),
      left,
      transform: "translate(-100%, -50%)",
    };
  }
  if (placement === "right") {
    const left = rect.x + rect.width + pad;
    if (left + calloutW > vw - 16) {
      // flip left
      return {
        top: clampY(rect.y + rect.height / 2, vh),
        left: rect.x - pad,
        transform: "translate(-100%, -50%)",
      };
    }
    return {
      top: clampY(rect.y + rect.height / 2, vh),
      left,
      transform: "translate(0, -50%)",
    };
  }
  return centered;
}

function clampY(y: number, vh: number) {
  return Math.max(16 + 140, Math.min(y, vh - 16 - 140));
}
