import { Canvas } from "@/components/canvas";

export default function Home() {
  return (
    <main className="relative flex-1 h-[100dvh] w-full">
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-5">
        <div className="pointer-events-auto flex items-center gap-2.5">
          <span
            aria-hidden
            className="inline-block h-2.5 w-2.5 rounded-full bg-[--accent] shadow-[0_0_16px_var(--accent-glow)]"
          />
          <span className="font-mono text-sm tracking-[0.22em] text-[--foreground]/80">
            AXON
          </span>
        </div>
        <div className="pointer-events-auto font-mono text-[11px] uppercase tracking-[0.18em] text-[--foreground]/40">
          M1 · canvas stub
        </div>
      </header>

      <Canvas />
    </main>
  );
}
