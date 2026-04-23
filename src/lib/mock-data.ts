export type RoleId = string;
export type CriterionId = string;
export type CandidateId = string;

export type Role = {
  id: RoleId;
  name: string;
  short: string;
  dept: string;
  openedAt: string;
  hiringManager: string;
};

export type CriterionType =
  | "experience"
  | "skill"
  | "education"
  | "communication"
  | "fit";

export type Criterion = {
  id: CriterionId;
  roleId: RoleId;
  name: string;
  type: CriterionType;
  strictness: 1 | 2 | 3 | 4 | 5;
  description: string;
  excludes: string[];
};

export type ScoreCell = {
  score: number;
  evidence: string[];
};

export type Candidate = {
  id: CandidateId;
  roleId: RoleId;
  name: string;
  headline: string;
  submittedAt: string;
  location: string;
  scores: Record<CriterionId, ScoreCell>;
  status: "advance" | "hold" | "reject" | "scoring";
  resumeSummary: string;
};

export const ROLES: Role[] = [
  {
    id: "r-backend",
    name: "Senior Backend Engineer",
    short: "Sr Backend Engr",
    dept: "Engineering",
    openedAt: "Opened 14 days ago",
    hiringManager: "Arjun Mehta",
  },
  {
    id: "r-designer",
    name: "Product Designer",
    short: "Product Designer",
    dept: "Product",
    openedAt: "Opened 6 days ago",
    hiringManager: "Sofia Iversen",
  },
  {
    id: "r-ae",
    name: "Account Executive · Mid-market",
    short: "AE · Mid-market",
    dept: "Sales",
    openedAt: "Opened 21 days ago",
    hiringManager: "Marcus Okafor",
  },
];

export const CRITERIA: Record<RoleId, Criterion[]> = {
  "r-backend": [
    {
      id: "crit-be-exp",
      roleId: "r-backend",
      name: "Backend experience",
      type: "experience",
      strictness: 4,
      description:
        "5+ years building production backend systems. Distributed systems experience and on-call ownership strongly preferred.",
      excludes: ["school prestige", "company prestige", "age", "location"],
    },
    {
      id: "crit-be-sysdes",
      roleId: "r-backend",
      name: "System design depth",
      type: "skill",
      strictness: 4,
      description:
        "Can reason about architecture-level trade-offs: consistency, latency, failure modes, cost.",
      excludes: ["school prestige", "accent", "academic credentials"],
    },
    {
      id: "crit-be-comm",
      roleId: "r-backend",
      name: "Written communication",
      type: "communication",
      strictness: 3,
      description:
        "Clear technical writing — RFCs, PR descriptions, runbooks. Public writing is a plus but not required.",
      excludes: ["native-English fluency", "school prestige"],
    },
  ],
  "r-designer": [
    {
      id: "crit-de-port",
      roleId: "r-designer",
      name: "Portfolio quality",
      type: "skill",
      strictness: 5,
      description:
        "Shipped product work with clear role, process, and outcome. Not side projects or redesign concepts.",
      excludes: ["school prestige", "agency prestige"],
    },
    {
      id: "crit-de-collab",
      roleId: "r-designer",
      name: "Cross-functional collaboration",
      type: "fit",
      strictness: 3,
      description:
        "Evidence of working closely with engineering and PM — shipping under constraints, not just handoffs.",
      excludes: ["years of experience"],
    },
  ],
  "r-ae": [
    {
      id: "crit-ae-quota",
      roleId: "r-ae",
      name: "Quota attainment",
      type: "experience",
      strictness: 4,
      description:
        "3 consecutive quarters at or above quota in a comparable ACV range ($20k–$150k).",
      excludes: ["company prestige"],
    },
    {
      id: "crit-ae-domain",
      roleId: "r-ae",
      name: "Industry fit",
      type: "fit",
      strictness: 3,
      description:
        "B2B SaaS sales to engineering or product buyers. Dev-tools experience is a strong plus.",
      excludes: ["school prestige", "sales methodology religion"],
    },
  ],
};

function score(v: number, evidence: string[]): ScoreCell {
  return { score: v, evidence };
}

export const CANDIDATES: Record<RoleId, Candidate[]> = {
  "r-backend": [
    {
      id: "cand-maya",
      roleId: "r-backend",
      name: "Maya Chen",
      headline: "Sr SWE · ex-Stripe · 7 yrs",
      submittedAt: "2h ago",
      location: "Austin, TX",
      status: "advance",
      resumeSummary:
        "Seven years at payments infrastructure, led a team of four on merchant-facing routing. Moving back to IC to go deeper on systems.",
      scores: {
        "crit-be-exp": score(4.2, [
          "Led migration of 40M QPS payment routing from monolith to event-driven services (reduced p99 by 38%).",
          "On-call rotation for three years across two sub-teams; author of the team's incident playbook.",
        ]),
        "crit-be-sysdes": score(3.8, [
          "Designed idempotency layer for refunds that shipped to all US merchants; handles out-of-order webhook delivery.",
        ]),
        "crit-be-comm": score(4.5, [
          "Wrote the internal RFC for retry-and-backoff semantics; now cited in eng onboarding.",
          "Co-authored public engineering blog post on replayable event logs.",
        ]),
      },
    },
    {
      id: "cand-daniel",
      roleId: "r-backend",
      name: "Daniel Rodriguez",
      headline: "Staff Engineer · B2B SaaS · 9 yrs",
      submittedAt: "5h ago",
      location: "Buenos Aires, AR",
      status: "hold",
      resumeSummary:
        "Nine years at small teams; went from lead to Staff without a large-org middle. Strong design instincts; production scale exposure is narrower.",
      scores: {
        "crit-be-exp": score(3.1, [
          "Built internal tools across 3-person startups; limited exposure to production-scale distributed systems.",
        ]),
        "crit-be-sysdes": score(4.5, [
          "Clear architecture doc on an event-sourcing migration at current company; careful trade-off analysis.",
        ]),
        "crit-be-comm": score(3.4, [
          "Résumé itself is well-structured; no external writing samples linked.",
        ]),
      },
    },
    {
      id: "cand-priya",
      roleId: "r-backend",
      name: "Priya Patel",
      headline: "Software Engineer · 2 yrs",
      submittedAt: "1d ago",
      location: "Bengaluru, IN",
      status: "reject",
      resumeSummary:
        "Recent grad with a strong self-study trajectory but limited production experience for a senior role.",
      scores: {
        "crit-be-exp": score(2.0, [
          "Recent bootcamp graduate; one internship building internal Django tools.",
        ]),
        "crit-be-sysdes": score(2.4, [
          "No architecture-level projects listed on résumé.",
        ]),
        "crit-be-comm": score(3.8, [
          "Specific, well-researched cover letter citing two of our public posts.",
        ]),
      },
    },
    {
      id: "cand-tom",
      roleId: "r-backend",
      name: "Tom Li",
      headline: "Principal · distributed systems · 12 yrs",
      submittedAt: "1d ago",
      location: "Seattle, WA",
      status: "advance",
      resumeSummary:
        "Twelve years across search, storage, and sync at large orgs. Interested in more IC depth after a lead role.",
      scores: {
        "crit-be-exp": score(4.8, [
          "Led infra team at Dropbox; spec'd cross-region replication for Paper.",
          "Seven years on-call across four services with public SLOs.",
        ]),
        "crit-be-sysdes": score(4.6, [
          "Conference talk at QCon: 'Handling 10x data volume in a quarter without a rewrite.'",
        ]),
        "crit-be-comm": score(4.4, [
          "Multiple well-cited engineering posts over five years; linked in application.",
        ]),
      },
    },
    {
      id: "cand-amara",
      roleId: "r-backend",
      name: "Amara Okonkwo",
      headline: "Senior SWE · fintech · 6 yrs",
      submittedAt: "2d ago",
      location: "London, UK",
      status: "advance",
      resumeSummary:
        "Six years across a scaling fintech. Has led cross-team projects without going into mgmt.",
      scores: {
        "crit-be-exp": score(3.9, [
          "Shipped ledger service handling 80k TPS; wrote failover runbook.",
        ]),
        "crit-be-sysdes": score(4.0, [
          "Specced reconciliation pipeline across 6 services; documented in internal engineering wiki.",
        ]),
        "crit-be-comm": score(3.6, [
          "Clear structure in résumé; internal wiki excerpts shared.",
        ]),
      },
    },
    {
      id: "cand-ryo",
      roleId: "r-backend",
      name: "Ryo Tanaka",
      headline: "Senior Engineer · streaming data · 8 yrs",
      submittedAt: "3d ago",
      location: "Tokyo, JP",
      status: "hold",
      resumeSummary:
        "Eight years on data infra; deep Kafka experience. Mostly in Japan — timezone fit flagged for discussion.",
      scores: {
        "crit-be-exp": score(4.1, [
          "Operated multi-region Kafka clusters at 2M msg/s across three services.",
        ]),
        "crit-be-sysdes": score(3.5, [
          "Contributed to internal design review for a consumer-group resharding rollout.",
        ]),
        "crit-be-comm": score(2.9, [
          "Résumé in EN; public writing primarily in Japanese. Hiring-team flagged for manual review.",
        ]),
      },
    },
  ],
  "r-designer": [
    {
      id: "cand-sofia",
      roleId: "r-designer",
      name: "Sofia Veneziano",
      headline: "Product Designer · ex-Notion · 5 yrs",
      submittedAt: "4h ago",
      location: "Berlin, DE",
      status: "advance",
      resumeSummary:
        "Five years in product. Strong portfolio, shipped consumer and prosumer work.",
      scores: {
        "crit-de-port": score(4.6, [
          "Portfolio case study: redesign of Notion's sharing UX, with clear problem framing and usage-metric outcomes.",
        ]),
        "crit-de-collab": score(4.1, [
          "Led weekly design-engineering syncs; multiple eng colleagues as references.",
        ]),
      },
    },
    {
      id: "cand-kenji",
      roleId: "r-designer",
      name: "Kenji Park",
      headline: "Senior Designer · enterprise SaaS · 8 yrs",
      submittedAt: "1d ago",
      location: "Vancouver, CA",
      status: "hold",
      resumeSummary:
        "Long enterprise background. Portfolio is strong on systems and less on zero-to-one features.",
      scores: {
        "crit-de-port": score(3.6, [
          "Strong design-systems work at past two roles; fewer end-to-end product cases.",
        ]),
        "crit-de-collab": score(4.3, [
          "Three written references from engineers and one from a PM.",
        ]),
      },
    },
    {
      id: "cand-jo",
      roleId: "r-designer",
      name: "Jo Abrams",
      headline: "Junior Designer · bootcamp · 1 yr",
      submittedAt: "2d ago",
      location: "Atlanta, GA",
      status: "reject",
      resumeSummary: "Recent bootcamp grad; portfolio is coursework-heavy.",
      scores: {
        "crit-de-port": score(1.8, [
          "Portfolio is bootcamp capstone and two redesign concepts; no shipped product work.",
        ]),
        "crit-de-collab": score(2.2, [
          "Limited professional collaboration experience listed.",
        ]),
      },
    },
  ],
  "r-ae": [
    {
      id: "cand-hannah",
      roleId: "r-ae",
      name: "Hannah Schuster",
      headline: "AE · dev tools · 4 yrs",
      submittedAt: "6h ago",
      location: "Remote · EU",
      status: "advance",
      resumeSummary:
        "Four years selling dev tooling. Exceeded quota in 5 of 6 quarters.",
      scores: {
        "crit-ae-quota": score(4.4, [
          "128%, 142%, 119%, 107%, 96%, 131% quarterly attainment across last 6 quarters.",
        ]),
        "crit-ae-domain": score(4.7, [
          "Sold CI/CD platform to engineering leadership; comfortable with technical discovery.",
        ]),
      },
    },
    {
      id: "cand-rafael",
      roleId: "r-ae",
      name: "Rafael Díaz",
      headline: "Senior AE · HR SaaS · 6 yrs",
      submittedAt: "1d ago",
      location: "Miami, FL",
      status: "hold",
      resumeSummary: "Strong quota history; coming from HR SaaS not dev tools.",
      scores: {
        "crit-ae-quota": score(4.2, [
          "Hit 105–135% across last 8 quarters at Workday partner.",
        ]),
        "crit-ae-domain": score(2.8, [
          "No dev-tools experience; HR-tech buyer journey is quite different.",
        ]),
      },
    },
    {
      id: "cand-nicole",
      roleId: "r-ae",
      name: "Nicole Brant",
      headline: "AE · infra · 3 yrs",
      submittedAt: "3d ago",
      location: "Boston, MA",
      status: "advance",
      resumeSummary: "Three years at an observability platform; rapid ramp.",
      scores: {
        "crit-ae-quota": score(3.9, [
          "Hit 115% in last full quarter; ramping trend after first year.",
        ]),
        "crit-ae-domain": score(4.3, [
          "Sold to SRE and platform-engineering teams; fluent on monitoring taxonomies.",
        ]),
      },
    },
  ],
};

export function getCandidateCount(roleId: RoleId): number {
  return CANDIDATES[roleId]?.length ?? 0;
}

export function criterionTypeLabel(t: CriterionType): string {
  switch (t) {
    case "experience":
      return "Experience";
    case "skill":
      return "Skill";
    case "education":
      return "Education";
    case "communication":
      return "Communication";
    case "fit":
      return "Fit";
  }
}
