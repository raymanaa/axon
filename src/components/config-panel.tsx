"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MousePointerClick, X } from "lucide-react";
import type { ChangeEvent } from "react";
import type { AxonNode, AxonNodeData, NodeKind } from "@/lib/node-types";
import { NODE_META } from "@/lib/node-types";

type Props = {
  node: AxonNode | null;
  onUpdate: (id: string, patch: Partial<AxonNodeData>) => void;
};

export function ConfigPanel({ node, onUpdate }: Props) {
  return (
    <aside className="flex h-full w-[320px] shrink-0 flex-col border-l border-border bg-muted/40">
      <AnimatePresence mode="wait">
        {node ? (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.18 }}
            className="flex h-full flex-col"
          >
            <Header kind={(node.type ?? "trigger") as NodeKind} id={node.id} />
            <div className="flex-1 overflow-y-auto px-4 py-3">
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
            <MousePointerClick
              className="h-6 w-6 text-foreground/30"
              strokeWidth={1.5}
            />
            <p className="text-xs text-foreground/45 leading-relaxed">
              Select a node to configure it.
              <br />
              Drag nodes from the left panel to add them to the canvas.
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
    <div className="flex items-center justify-between gap-2 border-b border-border/80 px-4 py-3">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden
          className="inline-block h-2 w-2 rounded-full"
          style={{
            background: meta.accent,
            boxShadow: `0 0 10px ${meta.accent}aa`,
          }}
        />
        <div className="min-w-0">
          <div
            className="text-[10px] font-mono uppercase tracking-[0.2em]"
            style={{ color: meta.accent }}
          >
            {meta.title}
          </div>
          <div className="text-[10px] font-mono text-foreground/40 truncate">
            {id}
          </div>
        </div>
      </div>
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
                  model: e.target.value as "gemini-2.5-flash" | "gemini-2.5-pro",
                })
              }
            >
              <option value="gemini-2.5-flash">gemini-2.5-flash</option>
              <option value="gemini-2.5-pro">gemini-2.5-pro</option>
            </Select>
          </Field>
          <Field
            label="Prompt"
            hint="Use {{input}} to reference previous node's output."
          >
            <Textarea
              rows={8}
              value={data.prompt}
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
            label="Classifier prompt"
            hint="LLM instruction for picking a branch."
          >
            <Textarea
              rows={4}
              value={data.classifier}
              onChange={(e) => onUpdate(id, { classifier: e.target.value })}
            />
          </Field>
          <Field label="Branches" hint="One class per line. Each becomes a handle.">
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
    <label className="mb-4 block">
      <div className="mb-1.5 text-[10px] uppercase tracking-[0.18em] font-mono text-foreground/50">
        {label}
      </div>
      {children}
      {hint && (
        <div className="mt-1.5 text-[11px] text-foreground/40 leading-relaxed">
          {hint}
        </div>
      )}
    </label>
  );
}

const inputBase =
  "w-full rounded-md border border-border bg-background/60 px-2.5 py-1.5 text-sm text-foreground placeholder:text-foreground/30 outline-none transition-colors focus:border-accent focus:bg-background focus:ring-2 focus:ring-accent/25";

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
