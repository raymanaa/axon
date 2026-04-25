"use client";

import { GitBranch } from "lucide-react";
import { Canvas } from "@/components/canvas";

export function PipelineView() {
  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div className="border-b border-line bg-paper px-8 py-4">
        <div className="mx-auto flex max-w-[1100px] items-start gap-4">
          <span
            aria-hidden
            className="mt-[3px] flex h-6 w-6 items-center justify-center rounded-md bg-card border border-line"
          >
            <GitBranch className="h-3.5 w-3.5 text-ink-2" strokeWidth={1.75} />
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="serif text-[20px] leading-[1.2] text-ink">
              The pipeline <span className="serif-italic">is</span> the audit.
            </h2>
            <p className="mt-1 max-w-[680px] text-[12.5px] leading-[1.65] text-ink-2">
              The underlying graph every candidate runs through. Parse résumé →
              score each criterion → Fit gate routes advance / hold / reject
              → commit decision. Most recruiters never need to open this tab;
              it's here for compliance, legal, and hiring-manager review.
            </p>
          </div>
          <div className="hidden md:block text-right">
            <div className="font-mono text-[10.5px] text-ink-3 uppercase tracking-[0.16em]">
              Pipeline version
            </div>
            <div className="mt-1 font-mono text-[13px] text-ink tabular-nums">
              v12 · <span className="text-ink-3">3a7f9c2</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        <Canvas />
      </div>
    </div>
  );
}
