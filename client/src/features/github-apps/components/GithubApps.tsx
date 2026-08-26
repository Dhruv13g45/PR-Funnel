import React from "react";
import GithubConnectCard from "./GithubConnectCard";

const GithubApps = () => {
  const [pointer, setPointer] = React.useState({ x: 50, y: 50 });

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();

    setPointer({
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100,
    });
  };

  return (
    <div
      className="relative isolate flex min-h-full items-center justify-center overflow-hidden bg-slate-950/40 p-6"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setPointer({ x: 50, y: 50 })}
      style={
        {
          "--pointer-x": `${pointer.x}%`,
          "--pointer-y": `${pointer.y}%`,
          backgroundImage:
            "radial-gradient(circle at var(--pointer-x) var(--pointer-y), rgba(56, 189, 248, 0.12), transparent 24rem)",
        } as React.CSSProperties
      }
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(rgba(56, 189, 248, 0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.045) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[8%] rounded-[2rem] border border-slate-800/50"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[12%] top-[27%] h-px w-[23%] bg-gradient-to-r from-transparent via-sky-400/35 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[25%] right-[9%] h-px w-[28%] bg-gradient-to-r from-transparent via-sky-400/25 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[19%] top-[27%] h-2 w-2 rounded-full border border-sky-300/50 bg-sky-400/30 shadow-[0_0_18px_rgba(56,189,248,0.55)] motion-safe:animate-pulse"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[25%] right-[36%] h-1.5 w-1.5 rounded-full bg-emerald-400/60 shadow-[0_0_14px_rgba(52,211,153,0.5)] motion-safe:animate-pulse"
      />

      <div className="relative z-10 flex min-h-full w-full items-center justify-center">
        <GithubConnectCard />
      </div>
    </div>
  );
};

export default GithubApps;
