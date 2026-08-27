import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Database,
  GitBranch,
  GitPullRequest,
  ScanSearch,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import QuietInteractiveBackdrop from "./QuietInteractiveBackdrop";

const steps = [
  {
    number: "01",
    label: "Connect GitHub",
    title: "Bring your repositories into one focused workspace.",
    description:
      "Authenticate with GitHub and choose the repositories your team wants PR Funnel to understand.",
    icon: GitBranch,
    color: "text-sky-300",
    detail: "Access stays inside GitHub's permission model.",
  },
  {
    number: "02",
    label: "Index the codebase",
    title: "Give every pull request the context behind it.",
    description:
      "PR Funnel reads relevant source files, chunks the code, and builds a searchable picture of your repository.",
    icon: Database,
    color: "text-indigo-300",
    detail: "Relevant files are prepared for fast retrieval.",
  },
  {
    number: "03",
    label: "Open a pull request",
    title: "Keep your usual GitHub workflow.",
    description:
      "When a pull request arrives, its branch, changes, and repository context are captured for analysis.",
    icon: GitPullRequest,
    color: "text-amber-300",
    detail: "No new process for contributors to learn.",
  },
  {
    number: "04",
    label: "Review with signal",
    title: "Turn code changes into prioritized findings.",
    description:
      "AI-assisted analysis surfaces issues, severity, and suggestions so reviewers can spend time where it matters.",
    icon: ScanSearch,
    color: "text-emerald-300",
    detail: "Findings stay attached to the pull request history.",
  },
];

const Workflow = () => {
  const [activeStep, setActiveStep] = useState(0);
  const step = steps[activeStep];
  const StepIcon = step.icon;

  return (
    <QuietInteractiveBackdrop>
      <main className="min-h-screen px-5 py-6 text-slate-100 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <header className="flex items-center justify-between border-b border-slate-800/70 pb-5">
            <Link to="/" className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-500/15">
                <GitPullRequest className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-bold tracking-wide text-white">
                  PR Funnel
                </span>
                <span className="block text-[9px] font-semibold uppercase tracking-[0.2em] text-sky-400/80">
                  Code intelligence
                </span>
              </span>
            </Link>
            <Link
              to="/sign-in"
              className="text-xs font-semibold text-slate-400 transition hover:text-white"
            >
              Get started <ArrowRight className="ml-1 inline size-3.5" />
            </Link>
          </header>

          <section className="pb-16 pt-14 lg:pb-24 lg:pt-20">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl"
            >
              <div className="mb-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-400">
                <Sparkles className="size-3.5" /> The workflow
              </div>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                From repository context to review clarity.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-400">
                PR Funnel fits around the way your team already ships. Select a
                stage to see what happens behind the scenes.
              </p>
            </motion.div>

            <div className="mt-12 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <nav aria-label="Workflow steps" className="space-y-2">
                {steps.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = index === activeStep;
                  return (
                    <button
                      key={item.number}
                      type="button"
                      onClick={() => setActiveStep(index)}
                      className={`group relative flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${isActive ? "border-sky-400/30 bg-slate-900/80 shadow-lg shadow-slate-950/20" : "border-transparent bg-slate-900/25 hover:border-slate-800 hover:bg-slate-900/55"}`}
                    >
                      {isActive && (
                        <span className="absolute bottom-3 left-0 top-3 w-0.5 rounded-full bg-sky-400" />
                      )}
                      <span
                        className={`flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/70 ${isActive ? item.color : "text-slate-500"}`}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[10px] font-mono tracking-widest text-slate-600">
                          {item.number}
                        </span>
                        <span
                          className={`mt-1 block text-sm font-medium ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`}
                        >
                          {item.label}
                        </span>
                      </span>
                      <ArrowRight
                        className={`ml-auto size-4 ${isActive ? "text-sky-400" : "text-slate-700"}`}
                      />
                    </button>
                  );
                })}
              </nav>

              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/75 shadow-2xl shadow-slate-950/50 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                  <span className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />{" "}
                    Pipeline stage {step.number}
                  </span>
                  <span className="font-mono text-[10px] text-slate-600">
                    PR FUNNEL / FLOW
                  </span>
                </div>
                <div className="p-6 sm:p-9">
                  <div
                    className={`mb-7 flex size-14 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.04] ${step.color}`}
                  >
                    <StepIcon className="size-7" />
                  </div>
                  <h2 className="max-w-lg text-2xl font-semibold leading-tight text-white sm:text-3xl">
                    {step.title}
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">
                    {step.description}
                  </p>
                  <div className="mt-7 flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/45 p-4">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                    <p className="text-xs leading-5 text-slate-400">
                      {step.detail}
                    </p>
                  </div>
                  <div className="mt-8 flex items-center justify-between border-t border-slate-800/80 pt-5">
                    <span className="text-xs text-slate-600">
                      {activeStep + 1} of {steps.length}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        aria-label="Previous workflow step"
                        disabled={activeStep === 0}
                        onClick={() => setActiveStep((current) => current - 1)}
                        className="rounded-lg border border-slate-800 p-2 text-slate-400 transition hover:border-sky-500/40 hover:text-sky-300 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ArrowLeft className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Next workflow step"
                        disabled={activeStep === steps.length - 1}
                        onClick={() => setActiveStep((current) => current + 1)}
                        className="rounded-lg border border-slate-800 p-2 text-slate-400 transition hover:border-sky-500/40 hover:text-sky-300 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ArrowRight className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        </div>
      </main>
    </QuietInteractiveBackdrop>
  );
};

export default Workflow;
