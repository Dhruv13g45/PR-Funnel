import { motion } from "framer-motion";
import {
  ArrowRight,
  Activity,
  CheckCircle2,
  GitBranch,
  GitPullRequest,
  ScanSearch,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import QuietInteractiveBackdrop from "./QuietInteractiveBackdrop";
import ActionableFindingsPanel from "@/features/dashboard/components/ActionableFindingsPanel";
import ContextAwarePanel from "@/features/dashboard/components/ContextAwarePanel";
import SourceOfTruthPanel from "@/features/dashboard/components/SourceOfTruthPanel";

const pipeline = [
  {
    label: "Repository indexed",
    detail: "acme / storefront",
    icon: GitBranch,
    color: "text-sky-300",
  },
  {
    label: "Pull request scanned",
    detail: "#184 · Improve checkout flow",
    icon: ScanSearch,
    color: "text-indigo-300",
  },
  {
    label: "Review ready",
    detail: "3 findings · 1 high priority",
    icon: CheckCircle2,
    color: "text-emerald-300",
  },
];

const previewRepositories = [
  {
    id: "storefront",
    repoFullName: "acme / storefront",
    branch: "main",
    status: "synced",
    chunkCount: 248,
  },
  {
    id: "billing",
    repoFullName: "acme / billing-api",
    branch: "main",
    status: "syncing",
    chunkCount: 96,
  },
];

const previewPullRequests = [
  {
    repoFullName: "acme / storefront",
    title: "Improve checkout flow",
    prNumber: 184,
  },
  {
    repoFullName: "acme / billing-api",
    title: "Retry failed invoices",
    prNumber: 72,
  },
];

const previewReviews = [
  {
    id: "review-184",
    title: "Improve checkout flow",
    repoFullName: "acme / storefront",
    prNumber: 184,
    issues: [{ severity: "high" }, { severity: "medium" }, { severity: "low" }],
  },
  {
    id: "review-72",
    title: "Retry failed invoices",
    repoFullName: "acme / billing-api",
    prNumber: 72,
    issues: [{ severity: "critical" }],
  },
];

const LandingPage = () => {
  return (
    <QuietInteractiveBackdrop>
      <main className="min-h-screen overflow-hidden px-5 py-6 text-slate-100 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <header className="flex items-center justify-between border-b border-slate-800/70 pb-5">
            <Link to="/" className="group flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-500/15 transition duration-300 group-hover:rotate-[-6deg] group-hover:shadow-sky-400/25">
                <GitPullRequest className="size-5" />
              </span>
              <span>
                <span className="block text-[15px] font-bold tracking-wide text-white">
                  PR Funnel
                </span>
                <span className="block text-[9px] font-semibold uppercase tracking-[0.2em] text-sky-400/80">
                  Code intelligence platform
                </span>
              </span>
            </Link>
            <nav
              className="hidden items-center gap-7 text-xs font-medium text-slate-500 md:flex"
              aria-label="Main navigation"
            >
              <a
                href="#capabilities"
                className="transition hover:text-slate-200"
              >
                Capabilities
              </a>
              <Link
                to="/show-workflow"
                className="transition hover:text-slate-200"
              >
                Workflow
              </Link>
              <span className="flex items-center gap-2 border-l border-slate-800 pl-7 text-[10px] uppercase tracking-wider text-slate-600">
                <Activity className="size-3.5 text-emerald-400" /> Systems ready
              </span>
            </nav>
            <div className="flex items-center gap-3">
              <span className="hidden size-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)] sm:block" />
              <Link
                to="/sign-in"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-900/60 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:border-sky-400/40 hover:bg-slate-800 hover:text-white"
              >
                Sign in <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </header>

          <section className="grid items-center gap-14 pb-16 pt-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(440px,1.1fr)] lg:gap-20 lg:pb-24 lg:pt-24">
            <motion.div
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-300">
                <Sparkles className="size-3.5" /> Review with signal
              </div>
              <h1 className="max-w-xl text-5xl font-semibold leading-[1.04] tracking-tight text-white sm:text-6xl">
                Ship with more confidence in every pull request.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
                PR Funnel connects to GitHub, understands your codebase, and
                turns every review into a clear path from finding to fix.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/sign-in"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-xl shadow-slate-950/30 transition hover:bg-sky-50"
                >
                  <GitBranch className="size-4" /> Continue with GitHub{" "}
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  to="/show-workflow"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-700/80 bg-slate-900/50 px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-sky-500/40 hover:text-white"
                >
                  See the workflow
                </Link>
              </div>
              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="size-4 text-emerald-400" />{" "}
                  GitHub-native access
                </span>
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="size-4 text-sky-400" /> AI-assisted
                  reviews
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.6 }}
              className="relative"
              id="workflow"
            >
              <div className="absolute -inset-8 rounded-[3rem] bg-sky-400/[0.04] blur-3xl" />
              <div className="relative overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/80 shadow-2xl shadow-slate-950/70 backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
                    <span className="text-xs font-semibold text-slate-300">
                      Review workspace
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-600">
                    LIVE / 01
                  </span>
                </div>
                <div className="p-5 sm:p-7">
                  <div className="mb-7 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Current run
                      </p>
                      <h2 className="mt-2 text-xl font-semibold text-white">
                        Checkout refactor
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        acme / storefront · main
                      </p>
                    </div>
                    <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-right">
                      <p className="text-lg font-semibold text-emerald-300">
                        98%
                      </p>
                      <p className="text-[9px] uppercase tracking-wider text-emerald-400/70">
                        coverage
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {pipeline.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className="relative flex items-center gap-4 rounded-xl border border-slate-800/80 bg-slate-950/50 p-4"
                        >
                          {index < pipeline.length - 1 && (
                            <span className="absolute bottom-[-14px] left-[25px] h-3 w-px bg-slate-700" />
                          )}
                          <span
                            className={`flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] ${item.color}`}
                          >
                            <Icon className="size-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-200">
                              {item.label}
                            </p>
                            <p className="mt-1 truncate text-xs text-slate-500">
                              {item.detail}
                            </p>
                          </div>
                          <CheckCircle2 className="ml-auto size-4 shrink-0 text-emerald-400" />
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-slate-800/80 pt-5">
                    <span className="text-xs text-slate-500">
                      Analysis complete in 42s
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-300">
                      View findings <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          <section
            className="space-y-6 border-t border-slate-800/70 pt-12"
            id="capabilities"
          >
            <div className="max-w-2xl">
              <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-400">
                <Sparkles className="size-3.5" /> Built for better reviews
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                See the signal your team gets back.
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Explore the three layers that turn a repository connection into
                a review workflow people can trust.
              </p>
            </div>
            <ContextAwarePanel
              repositories={previewRepositories}
              pullRequests={previewPullRequests}
            />
            <ActionableFindingsPanel
              counts={{ total: 4, critical: 1, high: 1, medium: 1, low: 1 }}
              reviews={previewReviews}
            />
            <SourceOfTruthPanel repositories={previewRepositories} />
          </section>

          <section className="mt-5 grid gap-4 border-t border-slate-800/70 py-10 sm:grid-cols-3">
            <article className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/45 p-5 transition duration-300 hover:-translate-y-1 hover:border-sky-400/35 hover:bg-slate-900/70">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-sky-400/[0.06] blur-2xl transition group-hover:bg-sky-400/[0.12]" />
              <div className="relative flex items-start justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl border border-sky-400/20 bg-sky-400/10 text-sky-300">
                  <GitBranch className="size-5" />
                </div>
                <span className="font-mono text-[10px] tracking-widest text-slate-600">
                  01
                </span>
              </div>
              <h3 className="mt-6 text-base font-semibold text-slate-100">
                Context-aware
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Index the code that gives every change its meaning.
              </p>
              <div className="mt-6 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-sky-400/80">
                <span className="h-px w-5 bg-sky-400/50" /> Repository context
              </div>
            </article>
            <article className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/45 p-5 transition duration-300 hover:-translate-y-1 hover:border-indigo-400/35 hover:bg-slate-900/70">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-indigo-400/[0.06] blur-2xl transition group-hover:bg-indigo-400/[0.12]" />
              <div className="relative flex items-start justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-400/10 text-indigo-300">
                  <ScanSearch className="size-5" />
                </div>
                <span className="font-mono text-[10px] tracking-widest text-slate-600">
                  02
                </span>
              </div>
              <h3 className="mt-6 text-base font-semibold text-slate-100">
                Actionable findings
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Prioritize risk with findings your team can act on.
              </p>
              <div className="mt-6 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-indigo-300/80">
                <span className="h-px w-5 bg-indigo-400/50" /> Review
                intelligence
              </div>
            </article>
            <article className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/45 p-5 transition duration-300 hover:-translate-y-1 hover:border-emerald-400/35 hover:bg-slate-900/70">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-emerald-400/[0.06] blur-2xl transition group-hover:bg-emerald-400/[0.12]" />
              <div className="relative flex items-start justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                  <ShieldCheck className="size-5" />
                </div>
                <span className="font-mono text-[10px] tracking-widest text-slate-600">
                  03
                </span>
              </div>
              <h3 className="mt-6 text-base font-semibold text-slate-100">
                One source of truth
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Keep repository health and review history together.
              </p>
              <div className="mt-6 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-300/80">
                <span className="h-px w-5 bg-emerald-400/50" /> Release
                confidence
              </div>
            </article>
          </section>

          <footer className="border-t border-slate-800/70 py-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-xs">
                <Link to="/" className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-slate-800 text-sky-300">
                    <GitPullRequest className="size-4" />
                  </span>
                  <span className="text-sm font-semibold text-slate-200">
                    PR Funnel
                  </span>
                </Link>
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  A clearer path from code change to confident release.
                </p>
              </div>

              <nav
                aria-label="Footer navigation"
                className="grid grid-cols-2 gap-x-12 gap-y-3 text-xs sm:grid-cols-3"
              >
                <Link
                  to="/show-workflow"
                  className="text-slate-500 transition hover:text-sky-300"
                >
                  Workflow
                </Link>
                <Link
                  to="/sign-in"
                  className="text-slate-500 transition hover:text-sky-300"
                >
                  Sign in
                </Link>
                <a
                  href="#capabilities"
                  className="text-slate-500 transition hover:text-sky-300"
                >
                  Capabilities
                </a>
              </nav>

              <Link
                to="/sign-in"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-400/25 bg-sky-400/10 px-4 py-2.5 text-xs font-semibold text-sky-200 transition hover:border-sky-400/50 hover:bg-sky-400/15"
              >
                Connect GitHub <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <div className="mt-8 flex flex-col gap-2 border-t border-slate-800/60 pt-4 text-[10px] uppercase tracking-[0.16em] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
              <span>PR Funnel · Code intelligence platform</span>
              <span className="inline-flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-emerald-400" />{" "}
                Systems operational
              </span>
            </div>
          </footer>
        </div>
      </main>
    </QuietInteractiveBackdrop>
  );
};

export default LandingPage;
