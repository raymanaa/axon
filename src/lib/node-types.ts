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
 * shown as a 9x9 colored square in the node header, nothing more.
 * Copy is framed for the resume-screening use case.
 */
export const NODE_META: Record<
  NodeKind,
  { title: string; accent: string; description: string; hint: string }
> = {
  trigger: {
    title: "Candidate in",
    accent: "#3d8b5a",
    description: "ATS webhook · upload",
    hint: "Where an application enters the pipeline.",
  },
  llm: {
    title: "Score",
    accent: "#181715",
    description: "Rubric · Gemini",
    hint: "A rubric as a prompt. Scores the candidate 1–5 with evidence.",
  },
  tool: {
    title: "Parse · Enrich",
    accent: "#3b5884",
    description: "HTTP call",
    hint: "Extracts structured fields from the résumé, or enriches from LinkedIn / GitHub.",
  },
  route: {
    title: "Fit gate",
    accent: "#b45309",
    description: "Branch on score",
    hint: "Routes the candidate to advance, hold, or reject based on upstream scores.",
  },
  reply: {
    title: "Decision",
    accent: "#8a3a20",
    description: "Write audit record",
    hint: "Commits the final decision + evidence chain to the audit log.",
  },
};

export function makeNodeData(kind: NodeKind): AxonNodeData {
  switch (kind) {
    case "trigger":
      return {
        kind,
        label: "New application",
        subtitle: "Webhook from ATS",
      };
    case "llm":
      return {
        kind,
        label: "Score: Communication skills",
        model: "gemini-2.5-flash",
        prompt:
          "Score this candidate 1–5 on written communication. Cite two snippets from the résumé that support your score. Ignore name, age, location, school, and any demographic signals.",
      };
    case "tool":
      return {
        kind,
        label: "Enrich from LinkedIn",
        method: "GET",
        url: "https://api.example.com/enrich/linkedin",
      };
    case "route":
      return {
        kind,
        label: "Fit gate",
        classifier:
          "Given the scores above, should this candidate advance, hold for later review, or be rejected?",
        classes: ["advance", "hold", "reject"],
      };
    case "reply":
      return {
        kind,
        label: "Commit decision",
        template:
          "decision: {{decision}}\nevidence: {{evidence}}\nscored_by_pipeline_version: v{{version}}",
      };
  }
}
