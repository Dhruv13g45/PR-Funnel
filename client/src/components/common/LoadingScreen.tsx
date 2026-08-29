import { motion } from "framer-motion";
import { GitBranch } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* Background ambient glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        {/* Spinner Container */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* Pulsing glow outline */}
          <div className="absolute inset-0 rounded-full border border-sky-500/20 animate-pulse scale-110" />

          {/* Rotating outer ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="absolute inset-0 rounded-full border-t-2 border-r-2 border-transparent border-t-sky-400 border-r-indigo-400"
          />

          {/* Inner pulsing Git Branch icon */}
          <motion.div
            animate={{ scale: [0.95, 1.05, 0.95] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-sky-400 shadow-md shadow-sky-500/5"
          >
            <GitBranch className="h-5 w-5" />
          </motion.div>
        </div>

        {/* Text */}
        <div className="flex flex-col items-center gap-1.5 text-center">
          <h2 className="text-sm font-semibold tracking-wide bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            PR Funnel
          </h2>
          <p className="text-xs text-slate-500 font-medium tracking-wide animate-pulse">
            Syncing environment...
          </p>
        </div>
      </div>
    </div>
  );
}
