/// <reference types="@cloudflare/workers-types" />

type Env = {
  ASSETS: Fetcher;
  GEMINI_API_KEY: string;
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return handleApi(request, env, ctx);
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleApi(
  request: Request,
  env: Env,
  _ctx: ExecutionContext,
): Promise<Response> {
  const url = new URL(request.url);

  if (url.pathname === "/api/score" && request.method === "POST") {
    return handleScore(request, env);
  }

  if (url.pathname === "/api/health" && request.method === "GET") {
    return json({ ok: true, ts: Date.now() });
  }

  return json({ error: "not_found", path: url.pathname }, { status: 404 });
}

type ScoreRequest = {
  candidate: {
    name: string;
    headline: string;
    resumeSummary: string;
  };
  criterion: {
    name: string;
    type: string;
    strictness: number;
    description: string;
    excludes: string[];
  };
  model?: "gemini-2.5-flash" | "gemini-2.5-pro";
};

type ScoreResponse = {
  score: number;
  evidence: string[];
  reasoning: string;
  model: string;
  pipelineVersion: string;
  pipelineHash: string;
};

async function handleScore(request: Request, env: Env): Promise<Response> {
  let body: ScoreRequest;
  try {
    body = (await request.json()) as ScoreRequest;
  } catch {
    return json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body?.candidate?.resumeSummary || !body?.criterion?.name) {
    return json({ error: "missing_fields" }, { status: 400 });
  }

  const model = body.model ?? "gemini-2.5-flash";
  const prompt = buildScoringPrompt(body);

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;

  try {
    const resp = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              score: { type: "number" },
              evidence: {
                type: "array",
                items: { type: "string" },
                minItems: 1,
                maxItems: 4,
              },
              reasoning: { type: "string" },
            },
            required: ["score", "evidence", "reasoning"],
          },
        },
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return json(
        { error: "gemini_error", status: resp.status, detail: text.slice(0, 400) },
        { status: 502 },
      );
    }

    const data = (await resp.json()) as {
      candidates?: {
        content?: { parts?: { text?: string }[] };
      }[];
    };
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!text) {
      return json({ error: "empty_gemini_response" }, { status: 502 });
    }

    let parsed: { score: number; evidence: string[]; reasoning: string };
    try {
      parsed = JSON.parse(text);
    } catch {
      return json(
        { error: "invalid_gemini_json", raw: text.slice(0, 400) },
        { status: 502 },
      );
    }

    const score = Math.max(1, Math.min(5, Number(parsed.score)));
    const evidence = Array.isArray(parsed.evidence)
      ? parsed.evidence.filter((s) => typeof s === "string" && s.trim().length > 0).slice(0, 4)
      : [];
    const reasoning =
      typeof parsed.reasoning === "string" ? parsed.reasoning : "";

    const result: ScoreResponse = {
      score,
      evidence,
      reasoning,
      model,
      pipelineVersion: "v12",
      pipelineHash: "3a7f9c2",
    };

    return json(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return json(
      {
        error: "fetch_failed",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }
}

function buildScoringPrompt(req: ScoreRequest): string {
  const { candidate, criterion } = req;
  const strictness = ["open", "relaxed", "balanced", "strict", "very strict"][
    criterion.strictness - 1
  ];
  const excludeList =
    criterion.excludes.length > 0
      ? criterion.excludes.map((x) => `- ${x}`).join("\n")
      : "- (no explicit exclusions)";

  return `You are a scoring agent for résumé screening. Your output is auditable: scores must be backed by verbatim evidence quoted from the candidate's résumé.

CRITERION
Name: ${criterion.name}
Type: ${criterion.type}
Strictness: ${strictness} (${criterion.strictness}/5)
What great looks like: ${criterion.description}

IGNORE WHEN SCORING (these signals must not influence your score):
${excludeList}

CANDIDATE
Name: ${candidate.name}
Headline: ${candidate.headline}
Résumé summary:
${candidate.resumeSummary}

TASK
Return JSON with:
- score: a number 1.0-5.0 (one decimal) reflecting how well the candidate meets this criterion, calibrated to the strictness level
- evidence: 1-3 verbatim quotes from the résumé summary that support the score. Quotes must be substrings of the candidate input above. Do NOT paraphrase.
- reasoning: 1-2 sentences explaining the score, referencing the evidence. No demographic commentary.

If the résumé contains insufficient signal for a criterion, score lower rather than guessing — but still provide the most relevant quote you can find as evidence. Respond only with the JSON object.`;
}

function json(obj: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(obj), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}
