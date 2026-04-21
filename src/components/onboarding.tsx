"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "axon.onboarding.dismissed.v1";

type Step = {
  eyebrow: string;
  title: string;
  body: string;
  callout?: string;
};

const STEPS: Step[] = [
  {
    eyebrow: "Welcome",
    title: "Build AI agents, visually.",
    body: "Axon is a canvas for wiring up multi-step agents. Drop nodes, connect them, run the graph. The output of each node flows into the next.",
  },
  {
    eyebrow: "The workspace",
    title: "Three panels. One idea each.",
    body: "The left is a palette of node types. The middle is your canvas. The right configures whatever node you've selected. That's the whole app.",
    callout: "Left → drag.  Middle → wire.  Right → configure.",
  },
  {
    eyebrow: "Try it",
    title: "We've prewired an example.",
    body: "A Trigger flows into a language-model node, which flows into a Reply. Click the language-model node to see its prompt on the right, then edit it. Running the graph arrives in the next milestone.",
    callout: "Press  ?  anytime for keyboard shortcuts.",
  },
];

export function Onboarding() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const dismissed =
      typeof window !== "undefined" &&
      window.localStorage.getItem(STORAGE_KEY) === "1";
    if (!dismissed) setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight" || e.key === "Enter") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step]);

  function close() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "1");
    }
    setOpen(false);
  }
  function next() {
    if (step < STEPS.length - 1) setStep(step + 1);
    else close();
  }
  function prev() {
    if (step > 0) setStep(step - 1);
  }

  const current = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(24,23,21,0.18) 0%, rgba(24,23,21,0.32) 100%)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          }}
          onClick={close}
        >
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.2, 0, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[560px] rounded-xl border border-line bg-card shadow-[0_20px_60px_rgba(24,23,21,0.18)]"
          >
            <div className="px-8 pt-7 pb-6">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="block h-[9px] w-[9px] rounded-sm bg-[color:var(--accent)]"
                />
                <span className="text-[10.5px] font-mono uppercase tracking-[0.2em] text-ink-2">
                  {current.eyebrow} · {step + 1} / {STEPS.length}
                </span>
              </div>

              <h2 className="serif mt-5 text-[34px] leading-[1.08] tracking-[-0.015em] text-ink">
                {current.title.split(/(\s+)/).map((chunk, i) =>
                  chunk.trim() === "visually." ||
                  chunk.trim() === "configure." ||
                  chunk.trim() === "example." ? (
                    <em
                      key={i}
                      className="serif-italic"
                      style={{ fontStyle: "italic" }}
                    >
                      {chunk}
                    </em>
                  ) : (
                    <span key={i}>{chunk}</span>
                  ),
                )}
              </h2>

              <p className="mt-4 text-[14.5px] leading-[1.65] text-ink-2 max-w-[460px]">
                {current.body}
              </p>

              {current.callout && (
                <div className="mt-4 rounded-md border border-line bg-paper px-3.5 py-2.5 text-[12.5px] font-mono text-ink-2">
                  {current.callout}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-line px-6 py-3.5">
              <div className="flex items-center gap-1.5">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Go to step ${i + 1}`}
                    onClick={() => setStep(i)}
                    className={[
                      "h-1.5 rounded-full transition-all",
                      i === step
                        ? "w-6 bg-ink"
                        : "w-1.5 bg-line-2 hover:bg-ink-3",
                    ].join(" ")}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1">
                {!last && (
                  <button
                    onClick={close}
                    className="px-3 py-1.5 text-[12.5px] text-ink-2 hover:text-ink transition-colors"
                  >
                    Skip tour
                  </button>
                )}
                {step > 0 && (
                  <button
                    onClick={prev}
                    className="px-3 py-1.5 text-[12.5px] text-ink-2 hover:text-ink transition-colors"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={next}
                  className="group flex items-center gap-1.5 rounded-md bg-ink text-paper px-3.5 py-1.5 text-[12.5px] font-medium hover:bg-[color:var(--ink-2)] transition-colors"
                >
                  <span>{last ? "Got it" : "Next"}</span>
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                    strokeWidth={2}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
