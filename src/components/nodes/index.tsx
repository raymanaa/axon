"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import type {
  AxonNode,
  LLMData,
  ReplyData,
  RouteData,
  ToolData,
  TriggerData,
} from "@/lib/node-types";
import { NodeShell } from "./node-shell";

type TypedNodeProps<D extends AxonNode["data"]> = NodeProps<
  AxonNode & { data: D }
>;

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[13px] font-medium text-ink">{children}</div>;
}

function Sub({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-0.5 text-[11.5px] text-ink-2 leading-relaxed">
      {children}
    </div>
  );
}

function Chip({
  children,
  tone = "ink",
}: {
  children: React.ReactNode;
  tone?: "ink" | "accent";
}) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-[4px] px-1.5 py-[2px]",
        "font-mono text-[10px] tracking-[0.02em]",
        tone === "accent"
          ? "bg-accent-soft text-[color:var(--accent)]"
          : "bg-paper-2 text-ink-2 border border-line",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

export function TriggerNode({ data, selected }: TypedNodeProps<TriggerData>) {
  return (
    <NodeShell kind="trigger" selected={selected} hasInput={false}>
      <Label>{data.label}</Label>
      <Sub>{data.subtitle}</Sub>
    </NodeShell>
  );
}

export function LLMNode({ data, selected }: TypedNodeProps<LLMData>) {
  return (
    <NodeShell kind="llm" selected={selected}>
      <Label>{data.label}</Label>
      <div className="mt-1.5">
        <Chip>{data.model.replace("gemini-", "")}</Chip>
      </div>
      <div className="mt-2 text-[11.5px] text-ink-2 leading-relaxed line-clamp-2 font-mono">
        {data.prompt || <span className="italic text-ink-3">No prompt</span>}
      </div>
    </NodeShell>
  );
}

export function ToolNode({ data, selected }: TypedNodeProps<ToolData>) {
  return (
    <NodeShell kind="tool" selected={selected}>
      <Label>{data.label}</Label>
      <div className="mt-1.5 flex items-center gap-1.5">
        <Chip>{data.method}</Chip>
        <span className="font-mono text-[11px] text-ink-2 truncate min-w-0">
          {data.url.replace(/^https?:\/\//, "")}
        </span>
      </div>
    </NodeShell>
  );
}

export function RouteNode({ data, selected }: TypedNodeProps<RouteData>) {
  const count = Math.max(data.classes.length, 1);
  return (
    <NodeShell
      kind="route"
      selected={selected}
      hasOutput={false}
      extraHandles={
        <>
          {data.classes.map((cls, i) => {
            const top = ((i + 1) / (count + 1)) * 100;
            return (
              <Handle
                key={cls + i}
                id={cls}
                type="source"
                position={Position.Right}
                style={{ top: `${top}%` }}
                className="!-mr-[1px]"
              />
            );
          })}
        </>
      }
    >
      <Label>{data.label}</Label>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {data.classes.length === 0 ? (
          <span className="text-[11px] text-ink-3 italic">No branches yet</span>
        ) : (
          data.classes.map((cls) => <Chip key={cls}>{cls}</Chip>)
        )}
      </div>
    </NodeShell>
  );
}

export function ReplyNode({ data, selected }: TypedNodeProps<ReplyData>) {
  return (
    <NodeShell kind="reply" selected={selected} hasOutput={false}>
      <Label>{data.label}</Label>
      <div className="mt-1.5 font-mono text-[11px] text-ink-2 leading-relaxed line-clamp-2">
        {data.template}
      </div>
    </NodeShell>
  );
}

export const nodeTypes = {
  trigger: TriggerNode,
  llm: LLMNode,
  tool: ToolNode,
  route: RouteNode,
  reply: ReplyNode,
};
