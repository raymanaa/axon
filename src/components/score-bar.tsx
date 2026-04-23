"use client";

export function ScoreBar({
  score,
  max = 5,
  size = "md",
}: {
  score: number;
  max?: number;
  size?: "sm" | "md" | "lg";
}) {
  const pct = Math.max(0, Math.min(1, score / max));
  const heightCls =
    size === "sm" ? "h-[3px]" : size === "md" ? "h-[5px]" : "h-[6px]";
  const tone =
    score >= 4
      ? "bg-[color:var(--accent)]"
      : score >= 3
        ? "bg-ink-2"
        : "bg-line-2";

  return (
    <div className={`relative w-full overflow-hidden rounded-full bg-line ${heightCls}`}>
      <div
        className={`absolute inset-y-0 left-0 rounded-full ${tone}`}
        style={{ width: `${pct * 100}%` }}
      />
    </div>
  );
}

export function ScoreNumber({
  score,
  max = 5,
}: {
  score: number;
  max?: number;
}) {
  return (
    <span className="font-mono tabular-nums">
      <span className="text-ink">{score.toFixed(1)}</span>
      <span className="text-ink-3"> / {max}</span>
    </span>
  );
}
