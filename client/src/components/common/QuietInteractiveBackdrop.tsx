import React from "react";

interface QuietInteractiveBackdropProps {
  children: React.ReactNode;
}

const QuietInteractiveBackdrop = ({
  children,
}: QuietInteractiveBackdropProps) => {
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
      className="relative isolate min-h-screen w-full min-w-full overflow-hidden bg-slate-950"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setPointer({ x: 50, y: 50 })}
      style={
        {
          "--pointer-x": `${pointer.x}%`,
          "--pointer-y": `${pointer.y}%`,
          backgroundImage:
            "radial-gradient(circle at var(--pointer-x) var(--pointer-y), rgba(56, 189, 248, 0.045), transparent 20rem)",
        } as React.CSSProperties
      }
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(56, 189, 248, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.035) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
          maskImage:
            "linear-gradient(to bottom, transparent, black 8%, black 92%, transparent)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 border border-slate-800/30"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[12%] top-[24%] h-px w-[16%] bg-gradient-to-r from-transparent via-sky-400/15 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[22%] right-[10%] h-px w-[19%] bg-gradient-to-r from-transparent via-sky-400/12 to-transparent"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-[18%] top-[24%] size-1 rounded-full bg-sky-400/35 motion-safe:animate-pulse"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[22%] right-[28%] size-1 rounded-full bg-emerald-400/35 motion-safe:animate-pulse"
      />
      <div className="relative z-10 min-h-screen w-full">{children}</div>
    </div>
  );
};

export default QuietInteractiveBackdrop;
