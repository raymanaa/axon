import type { Node } from "@xyflow/react";

export type NodeKind = "trigger" | "llm" | "tool" | "route" | "reply";

export type TriggerData = {
  kind: "trigger";
  label: string;
  subtitle: string;
  [key: string]: unknown;
};

export type LLMData = {
  kind: "llm";
  label: string;
  model: "gemini-2.5-flash" | "gemini-2.5-pro";
  prompt: string;
  [key: string]: unknown;
};

export type ToolData = {
  kind: "tool";
  label: string;
  method: "GET" | "POST";
  url: string;
  [key: string]: unknown;
};

export type RouteData = {
  kind: "route";
  label: string;
  classifier: string;
  classes: string[];
  [key: string]: unknown;
};

export type ReplyData = {
  kind: "reply";
  label: string;
  template: string;
  [key: string]: unknown;
};

export type AxonNodeData =
  | TriggerData
  | LLMData
  | ToolData
  | RouteData
  | ReplyData;

export type AxonNode = Node<AxonNodeData, NodeKind>;

export const NODE_META: Record<
  NodeKind,
  { title: string; accent: string; description: string }
> = {
  trigger: {
    title: "Trigger",
    accent: "#34d399",
    description: "Start a run",
  },
  llm: {
    title: "LLM",
    accent: "#a78bfa",
    description: "Call a language model",
  },
  tool: {
    title: "Tool",
    accent: "#60a5fa",
    description: "Call an HTTP API or fetch a page",
  },
  route: {
    title: "Route",
    accent: "#f59e0b",
    description: "Branch on an LLM classification",
  },
  reply: {
    title: "Reply",
    accent: "#f472b6",
    description: "Render a final response",
  },
};

export function makeNodeData(kind: NodeKind): AxonNodeData {
  switch (kind) {
    case "trigger":
      return { kind, label: "Start", subtitle: "Manual run" };
    case "llm":
      return {
        kind,
        label: "LLM",
        model: "gemini-2.5-flash",
        prompt: "Summarize the input in one sentence.",
      };
    case "tool":
      return {
        kind,
        label: "HTTP",
        method: "GET",
        url: "https://hacker-news.firebaseio.com/v0/topstories.json",
      };
    case "route":
      return {
        kind,
        label: "Classify",
        classifier: "Is the input asking a question or giving a command?",
        classes: ["question", "command"],
      };
    case "reply":
      return {
        kind,
        label: "Reply",
        template: "{{previous}}",
      };
  }
}
