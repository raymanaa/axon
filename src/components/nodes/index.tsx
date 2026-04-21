"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Brain, Globe, Play, Send, Split } from "lucide-react";
import type {
  AxonNode,
  LLMData,
  ReplyData,
  RouteData,
  ToolData,
  TriggerData,
} from "@/lib/node-types";
import { NODE_META } from "@/lib/node-types";
import { NodeShell } from "./node-shell";

type TypedNodeProps<D extends AxonNode["data"]> = NodeProps<
  AxonNode & { data: D }
>;

export function TriggerNode({ data, selected }: TypedNodeProps<TriggerData>) {
  return (
    <NodeShell
      kind="trigger"
      icon={Play}
      title="Trigger"
      selected={selected}
      hasInput={false}
    >
      <div className="text-sm font-medium">{data.label}</div>
      <div className="mt-0.5 text-xs text-foreground/55">{data.subtitle}</div>
    </NodeShell>
  );
}

export function LLMNode({ data, selected }: TypedNodeProps<LLMData>) {
  return (
    <NodeShell kind="llm" icon={Brain} title="LLM" selected={selected}>
      <div className="text-sm font-medium">{data.label}</div>
      <div className="mt-1 flex items-center gap-1.5">
        <span className="inline-flex items-center rounded-md bg-background/60 px-1.5 py-0.5 text-[10px] font-mono text-foreground/70 border border-border">
          {data.model.replace("gemini-", "")}
        </span>
      </div>
      <div className="mt-2 text-xs text-foreground/55 line-clamp-3 leading-relaxed">
        {data.prompt || <span className="italic">no prompt</span>}
      </div>
    </NodeShell>
  );
}

export function ToolNode({ data, selected }: TypedNodeProps<ToolData>) {
  return (
    <NodeShell kind="tool" icon={Globe} title="Tool" selected={selected}>
      <div className="text-sm font-medium">{data.label}</div>
      <div className="mt-1.5 flex items-center gap-1.5">
        <span
          className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-mono"
          style={{
            background: "rgba(96, 165, 250, 0.12)",
            color: "#60a5fa",
          }}
        >
          {data.method}
        </span>
        <span className="font-mono text-[11px] text-foreground/55 truncate">
          {data.url.replace(/^https?:\/\//, "")}
        </span>
      </div>
    </NodeShell>
  );
}

export function RouteNode({ data, selected }: TypedNodeProps<RouteData>) {
  const accent = NODE_META.route.accent;
  const count = Math.max(data.classes.length, 1);
  return (
    <NodeShell
      kind="route"
      icon={Split}
      title="Route"
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
                className="!h-3 !w-3 !border-2 !border-background"
                style={{ top: `${top}%`, background: accent }}
              />
            );
          })}
        </>
      }
    >
      <div className="text-sm font-medium">{data.label}</div>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {data.classes.map((cls) => (
          <span
            key={cls}
            className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-mono border"
            style={{
              borderColor: `${accent}55`,
              color: accent,
              background: `${accent}15`,
            }}
          >
            {cls}
          </span>
        ))}
      </div>
    </NodeShell>
  );
}

export function ReplyNode({ data, selected }: TypedNodeProps<ReplyData>) {
  return (
    <NodeShell
      kind="reply"
      icon={Send}
      title="Reply"
      selected={selected}
      hasOutput={false}
    >
      <div className="text-sm font-medium">{data.label}</div>
      <div className="mt-1.5 font-mono text-[11px] text-foreground/55 line-clamp-2 leading-relaxed">
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
