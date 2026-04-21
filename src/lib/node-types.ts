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

/**
 * Restrained editorial palette — each kind gets one precise accent
 * shown as a 4px square in the node header, nothing more.
 */
export const NODE_META: Record<
  NodeKind,
  { title: string; accent: string; description: string; hint: string }
> = {
  trigger: {
    title: "Trigger",
    accent: "#3d8b5a",
    description: "Start a run",
    hint: "Where a workflow begins.",
  },
  llm: {
    title: "Language model",
    accent: "#181715",
    description: "Prompt Gemini",
    hint: "Sends a prompt; streams back tokens.",
  },
  tool: {
    title: "Tool",
    accent: "#3b5884",
    description: "HTTP · fetch",
    hint: "Calls an external API.",
  },
  route: {
    title: "Route",
    accent: "#b45309",
    description: "Classify & branch",
    hint: "Picks a branch based on input.",
  },
  reply: {
    title: "Reply",
    accent: "#8a3a20",
    description: "Final response",
    hint: "Renders the workflow's output.",
  },
};

export function makeNodeData(kind: NodeKind): AxonNodeData {
  switch (kind) {
    case "trigger":
      return { kind, label: "Start", subtitle: "Manual run" };
    case "llm":
      return {
        kind,
        label: "Summarize",
        model: "gemini-2.5-flash",
        prompt: "Summarize the input in one sentence.",
      };
    case "tool":
      return {
        kind,
        label: "Fetch",
        method: "GET",
        url: "https://hacker-news.firebaseio.com/v0/topstories.json",
      };
    case "route":
      return {
        kind,
        label: "Classify",
        classifier: "Is the input a question or a command?",
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
