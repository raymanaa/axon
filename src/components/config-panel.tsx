"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ChangeEvent } from "react";
import type { AxonNode, AxonNodeData, NodeKind } from "@/lib/node-types";
import { NODE_META } from "@/lib/node-types";

type Props = {
  node: AxonNode | null;
  onUpdate: (id: string, patch: Partial<AxonNodeData>) => void;
};

export function ConfigPanel({ node, onUpdate }: Props) {
  return (
    <aside className="flex h-full w-[340px] shrink-0 flex-col border-l border-line bg-paper">
      <AnimatePresence mode="wait">
        {node ? (
          <motion.div
            key={node.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="flex h-full flex-col"
          >
            <Header kind={(node.type ?? "trigger") as NodeKind} id={node.id} />
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <Form
                id={node.id}
                data={node.data as AxonNodeData}
                onUpdate={onUpdate}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center"
          >
            <div className="h-[1px] w-8 bg-line" />
            <p className="text-[12px] text-ink-2 leading-relaxed max-w-[220px]">
              Select a node to configure it.
            </p>
            <p className="text-[11px] text-ink-3 leading-relaxed max-w-[220px]">
              Click a card on the canvas, or drop a new one from the left.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}

function Header({ kind, id }: { kind: NodeKind; id: string }) {
  const meta = NODE_META[kind];
  return (
    <div className="border-b border-line px-5 py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            aria-hidden
            className="block h-[9px] w-[9px] rounded-sm shrink-0"
            style={{ background: meta.accent }}
          />
          <span className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-ink-2">
            {meta.title}
          </span>
        </div>
        <span className="font-mono text-[10.5px] text-ink-3 truncate">
          {id}
        </span>
      </div>
      <p className="mt-2.5 text-[12.5px] text-ink-2 leading-relaxed">
        {meta.hint}
      </p>
    </div>
  );
}

function Form({
  id,
  data,
  onUpdate,
}: {
  id: string;
  data: AxonNodeData;
  onUpdate: (id: string, patch: Partial<AxonNodeData>) => void;
}) {
  switch (data.kind) {
    case "trigger":
      return (
        <>
          <Field label="Label">
            <Input
              value={data.label}
              onChange={(e) => onUpdate(id, { label: e.target.value })}
            />
          </Field>
          <Field label="Subtitle">
            <Input
              value={data.subtitle}
              onChange={(e) => onUpdate(id, { subtitle: e.target.value })}
            />
          </Field>
        </>
      );
    case "llm":
      return (
        <>
          <Field label="Label">
            <Input
              value={data.label}
              onChange={(e) => onUpdate(id, { label: e.target.value })}
            />
          </Field>
          <Field label="Model">
            <Select
              value={data.model}
              onChange={(e) =>
                onUpdate(id, {
                  model: e.target.value as
                    | "gemini-2.5-flash"
                    | "gemini-2.5-pro",
                })
              }
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
            </Select>
          </Field>
          <Field
            label="Rubric (prompt)"
            hint="Your rubric IS the prompt. Every change becomes part of the audit trail — a new pipeline version."
          >
            <Textarea
              rows={10}
              value={data.prompt}
              data-onboarding-target="prompt-input"
              onChange={(e) => onUpdate(id, { prompt: e.target.value })}
            />
          </Field>
        </>
      );
    case "tool":
      return (
        <>
          <Field label="Label">
            <Input
              value={data.label}
              onChange={(e) => onUpdate(id, { label: e.target.value })}
            />
          </Field>
          <Field label="Method">
            <Select
              value={data.method}
              onChange={(e) =>
                onUpdate(id, { method: e.target.value as "GET" | "POST" })
              }
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
            </Select>
          </Field>
          <Field label="URL">
            <Input
              value={data.url}
              onChange={(e) => onUpdate(id, { url: e.target.value })}
              placeholder="https://…"
            />
          </Field>
        </>
      );
    case "route":
      return (
        <>
          <Field label="Label">
            <Input
              value={data.label}
              onChange={(e) => onUpdate(id, { label: e.target.value })}
            />
          </Field>
          <Field
            label="Classifier"
            hint="Instruction for the LLM that picks a branch."
          >
            <Textarea
              rows={4}
              value={data.classifier}
              onChange={(e) => onUpdate(id, { classifier: e.target.value })}
            />
          </Field>
          <Field
            label="Branches"
            hint="One class per line. Each becomes an output handle."
          >
            <Textarea
              rows={4}
              value={data.classes.join("\n")}
              onChange={(e) =>
                onUpdate(id, {
                  classes: e.target.value
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </Field>
        </>
      );
    case "reply":
      return (
        <>
          <Field label="Label">
            <Input
              value={data.label}
              onChange={(e) => onUpdate(id, { label: e.target.value })}
            />
          </Field>
          <Field
            label="Template"
            hint="Use {{previous}} or {{node_id.output}} to interpolate."
          >
            <Textarea
              rows={6}
              value={data.template}
              onChange={(e) => onUpdate(id, { template: e.target.value })}
            />
          </Field>
        </>
      );
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
    <label className="mb-5 block">
      <div className="mb-1.5 text-[10.5px] uppercase tracking-[0.16em] font-mono text-ink-3">
        {label}
      </div>
      {children}
      {hint && (
        <div className="mt-1.5 text-[11px] text-ink-3 leading-relaxed">
          {hint}
        </div>
      )}
    </label>
  );
}

const inputBase =
  "w-full rounded-md border border-line bg-card px-2.5 py-1.5 text-[13px] text-ink placeholder:text-ink-3 outline-none transition-[border-color,box-shadow] focus:border-[color:var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-soft)]";

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input type="text" {...props} className={inputBase} />;
}

function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { rows?: number },
) {
  return (
    <textarea
      {...props}
      className={`${inputBase} resize-none font-mono text-[12px] leading-relaxed`}
    />
  );
}

function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & {
    onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  },
) {
  return <select {...props} className={inputBase} />;
}
