"use client";

import { ChevronDown, ChevronRight, Plus, ShieldCheck } from "lucide-react";
import { useState } from "react";
import {
  CRITERIA,
  criterionTypeLabel,
  type Criterion,
  type RoleId,
} from "@/lib/mock-data";

type Props = {
  roleId: RoleId;
};

export function CriteriaView({ roleId }: Props) {
  const [items, setItems] = useState(() => CRITERIA[roleId] ?? []);

  function update(id: string, patch: Partial<Criterion>) {
    setItems((xs) => xs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6">
      <div className="mx-auto max-w-[760px]">
        <Intro count={items.length} />
        <div className="mt-6 space-y-4">
          {items.map((crit, i) => (
            <CriterionCard
              key={crit.id}
              index={i + 1}
              criterion={crit}
              onUpdate={(p) => update(crit.id, p)}
              data-onboarding-target={
                i === 0 ? "criterion-first" : undefined
              }
            />
          ))}
        </div>
        <button
          disabled
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-paper py-4 text-[12.5px] text-ink-3 transition-colors hover:border-line-2 disabled:cursor-not-allowed"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          <span>Add a criterion</span>
          <span className="ml-1 font-mono text-[10px]">soon</span>
        </button>
      </div>
    </div>
  );
}

function Intro({ count }: { count: number }) {
  return (
    <div>
      <h1 className="serif text-[28px] leading-[1.1] tracking-[-0.015em] text-ink">
        What you're screening{" "}
        <span className="serif-italic">for.</span>
      </h1>
      <p className="mt-3 max-w-[600px] text-[13.5px] leading-[1.7] text-ink-2">
        Each criterion becomes a score on every candidate, with evidence pulled
        verbatim from the résumé. Change anything and it becomes a new pipeline
        version — previous candidates stay linked to the rubric that scored
        them.
      </p>
      <div className="mt-4 flex items-center gap-2 text-[11.5px] text-ink-3">
        <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
        <span>
          {count} criteria · version v12 · last edited 3 days ago by Arjun
          Mehta
        </span>
      </div>
    </div>
  );
}

function CriterionCard({
  index,
  criterion,
  onUpdate,
  ...rest
}: {
  index: number;
  criterion: Criterion;
  onUpdate: (patch: Partial<Criterion>) => void;
} & React.HTMLAttributes<HTMLDivElement>) {
  const [open, setOpen] = useState(false);
  return (
    <div
      {...rest}
      className="rounded-xl border border-line bg-card transition-shadow hover:shadow-[0_2px_8px_rgba(24,23,21,0.04)]"
    >
      <div className="flex items-start gap-4 px-5 py-4">
        <div className="font-mono text-[11px] text-ink-3 mt-1 tabular-nums w-4">
          {String(index).padStart(2, "0")}
        </div>

        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={criterion.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="w-full bg-transparent text-[15px] font-medium text-ink outline-none focus:bg-paper rounded px-1 -mx-1 py-0.5"
          />
          <div className="mt-1 flex items-center gap-2 text-[11px] text-ink-3">
            <span className="font-mono uppercase tracking-[0.14em]">
              {criterionTypeLabel(criterion.type)}
            </span>
            <span aria-hidden>·</span>
            <StrictnessDisplay value={criterion.strictness} />
          </div>
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          className="flex h-7 w-7 items-center justify-center rounded-md text-ink-3 hover:bg-paper-2 hover:text-ink transition-colors"
          aria-label={open ? "Collapse" : "Expand"}
        >
          {open ? (
            <ChevronDown className="h-4 w-4" strokeWidth={2} />
          ) : (
            <ChevronRight className="h-4 w-4" strokeWidth={2} />
          )}
        </button>
      </div>

      {open && (
        <div className="border-t border-line px-5 py-4 space-y-5">
          <Field label="Strictness">
            <Slider
              value={criterion.strictness}
              onChange={(v) =>
                onUpdate({ strictness: v as Criterion["strictness"] })
              }
            />
            <p className="mt-1.5 text-[11px] text-ink-3 leading-relaxed">
              {strictnessHint(criterion.strictness)}
            </p>
          </Field>

          <Field
            label="What great looks like"
            hint="Plain-English notes. We translate this into a score rubric — no prompt writing required."
          >
            <textarea
              value={criterion.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              rows={3}
              className="w-full rounded-md border border-line bg-paper px-2.5 py-2 text-[13px] text-ink outline-none transition-[border-color,box-shadow] focus:border-[color:var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-soft)] focus:bg-card resize-none leading-relaxed"
            />
          </Field>

          <Field
            label="Ignore when scoring"
            hint="The pipeline is told not to consider these signals. This is visible in the audit log."
          >
            <div className="flex flex-wrap gap-1.5">
              {criterion.excludes.map((ex) => (
                <span
                  key={ex}
                  className="inline-flex items-center gap-1 rounded-md border border-line bg-paper px-2 py-1 text-[11px] text-ink-2"
                >
                  <span
                    aria-hidden
                    className="h-[4px] w-[4px] rounded-full bg-ink-3"
                  />
                  {ex}
                </span>
              ))}
            </div>
          </Field>
        </div>
      )}
    </div>
  );
}

function StrictnessDisplay({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-[3px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={[
            "h-[4px] w-[10px] rounded-[1px]",
            i < value ? "bg-ink" : "bg-line-2",
          ].join(" ")}
        />
      ))}
      <span className="ml-1.5 font-mono text-[10.5px]">
        {strictnessLabel(value)}
      </span>
    </span>
  );
}

function Slider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={[
              "h-8 w-10 rounded-md border text-[12px] font-mono transition-colors",
              value === v
                ? "bg-ink text-paper border-ink"
                : v <= value
                  ? "bg-paper-2 border-line-2 text-ink"
                  : "bg-card border-line text-ink-3 hover:text-ink",
            ].join(" ")}
          >
            {v}
          </button>
        ))}
      </div>
      <span className="font-mono text-[11.5px] text-ink-2 min-w-[80px]">
        {strictnessLabel(value)}
      </span>
    </div>
  );
}

function strictnessLabel(v: number) {
  return ["open", "relaxed", "balanced", "strict", "very strict"][v - 1];
}
function strictnessHint(v: number) {
  switch (v) {
    case 1:
      return "Lets most candidates through. Use for entry-level or exploratory roles.";
    case 2:
      return "Mildly selective. Borderline candidates advance with notes.";
    case 3:
      return "Balanced. Mid-tier candidates go to hold, not reject.";
    case 4:
      return "Selective. Only candidates with strong evidence advance.";
    case 5:
      return "Very strict. Clear reject on any gap; minimal holds.";
    default:
      return "";
  }
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 text-[10.5px] uppercase tracking-[0.16em] font-mono text-ink-3">
        {label}
      </div>
      {children}
      {hint && (
        <div className="mt-1.5 text-[11px] text-ink-3 leading-relaxed">
          {hint}
        </div>
      )}
    </div>
  );
}
