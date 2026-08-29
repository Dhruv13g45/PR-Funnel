import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  CircleDot,
  GitPullRequest,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import QuietInteractiveBackdrop from "@/components/common/QuietInteractiveBackdrop";

interface DashboardRepository {
  id: string;
  repoFullName: string;
  branch?: string;
  status: string;
  chunkCount?: number;
  syncedAt?: string | null;
  updatedAt?: string;
}

interface DashboardPullRequest {
  id: string;
  prNumber: number;
  repoFullName: string;
  title: string;
  authorLogin?: string | null;
  status: string;
  reviewedAt?: string | null;
  createdAt?: string;
}

interface DashboardReview extends Omit<DashboardPullRequest, "status"> {
  issues: { severity?: string }[];
}

interface DashboardResponse {
  repositories?: {
    totalRepoCount?: number;
    syncedRepoCount?: number;
    syncingRepoCount?: number;
    failedSyncRepoCount?: number;
    repositories?: DashboardRepository[];
  };
  pullRequests?: {
    totalPRCount?: number;
    reviewdPrCount?: number;
    pendingReviewPrCount?: number;
  };
  reviews?: {
    totalReviewCount?: number;
    totalIssuesFound?: number;
    criticalIssueCount?: number;
    highIssueCount?: number;
    mediumIssueCount?: number;
    lowIssueCount?: number;
  };
  recentPullRequests?: DashboardPullRequest[];
  recentReviews?: DashboardReview[];
  repositoryHealth?:
    | {
        success?: boolean;
        repositories?: DashboardRepository[];
      }
    | DashboardRepository[];
}

const statusStyles: Record<string, string> = {
  synced: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20",
  completed: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20",
  syncing: "text-sky-300 bg-sky-400/10 border-sky-400/20",
  processing: "text-amber-300 bg-amber-400/10 border-amber-400/20",
  failed: "text-rose-300 bg-rose-400/10 border-rose-400/20",
  pending: "text-slate-300 bg-slate-400/10 border-slate-400/20",
};

function formatDate(value?: string | null) {
  if (!value) return "Awaiting review";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function StatusPill({ status }: { status: string }) {
  const style = statusStyles[status.toLowerCase()] ?? statusStyles.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${style}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  detail: string;
  icon: typeof Activity;
  tone: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5 shadow-xl shadow-slate-950/10">
      <div
        className={`absolute -right-5 -top-5 h-24 w-24 rounded-full blur-2xl opacity-20 ${tone}`}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {label}
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-500">{detail}</p>
        </div>
        <div
          className={`rounded-xl border border-white/5 bg-white/[0.04] p-2.5 ${tone.replace("bg-", "text-")}`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

const Dashboard = () => {
  const dashboardQuery = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const { data } = await api.get<DashboardResponse>("/dashboard");
      return data;
    },
  });

  if (dashboardQuery.isLoading) {
    return (
      <QuietInteractiveBackdrop>
        <div className="min-h-full p-8 text-slate-400">
          Loading dashboard...
        </div>
      </QuietInteractiveBackdrop>
    );
  }

  if (dashboardQuery.isError) {
    return (
      <QuietInteractiveBackdrop>
        <div className="flex min-h-full items-center justify-center p-8">
          <div className="max-w-sm rounded-2xl border border-rose-900/50 bg-rose-950/20 p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-rose-400" />
            <h1 className="mt-4 text-lg font-semibold text-white">
              Dashboard unavailable
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              We could not load your GitHub activity.
            </p>
            <button
              onClick={() => dashboardQuery.refetch()}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700"
            >
              <RefreshCw className="h-4 w-4" /> Try again
            </button>
          </div>
        </div>
      </QuietInteractiveBackdrop>
    );
  }

  const dashboard = dashboardQuery.data ?? {};
  const repoInfo = dashboard.repositories ?? {};
  const pullRequestInfo = dashboard.pullRequests ?? {};
  const reviewInfo = dashboard.reviews ?? {};
  const health = Array.isArray(dashboard.repositoryHealth)
    ? dashboard.repositoryHealth
    : (dashboard.repositoryHealth?.repositories ?? repoInfo.repositories ?? []);

  return (
    <QuietInteractiveBackdrop>
      <div className="min-h-full overflow-x-hidden px-4 py-6 text-slate-100 sm:px-6 sm:py-7 lg:px-10">
        <div className="mx-auto max-w-[1500px]">
          <motion.header
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
          >
            <div>
              <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-400">
                <CircleDot className="h-3.5 w-3.5" /> Overview
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-white">
                Good to see you back.
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                A clear read on your repositories, pull requests, and review
                health.
              </p>
            </div>
            <button
              onClick={() => dashboardQuery.refetch()}
              title="Refresh dashboard"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2.5 text-xs font-medium text-slate-300 transition hover:border-sky-500/40 hover:text-sky-300"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${dashboardQuery.isFetching ? "animate-spin" : ""}`}
              />{" "}
              Refresh data
            </button>
          </motion.header>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            <MetricCard
              label="Repositories"
              value={repoInfo.totalRepoCount ?? 0}
              detail={`${repoInfo.syncedRepoCount ?? 0} synced`}
              icon={ShieldCheck}
              tone="bg-sky-400"
            />
            <MetricCard
              label="Pull requests"
              value={pullRequestInfo.totalPRCount ?? 0}
              detail={`${pullRequestInfo.pendingReviewPrCount ?? 0} awaiting review`}
              icon={GitPullRequest}
              tone="bg-indigo-400"
            />
            <MetricCard
              label="Reviews completed"
              value={reviewInfo.totalReviewCount ?? 0}
              detail={`${reviewInfo.totalIssuesFound ?? 0} issues found`}
              icon={CheckCircle2}
              tone="bg-emerald-400"
            />
            <MetricCard
              label="Critical issues"
              value={reviewInfo.criticalIssueCount ?? 0}
              detail={`${reviewInfo.highIssueCount ?? 0} high severity`}
              icon={AlertCircle}
              tone="bg-rose-400"
            />
          </motion.section>

          <div className="mt-6 grid min-w-0 gap-4 lg:gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
            <section className="min-w-0 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-6">
              <div className="mb-5 flex min-w-0 items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-white">
                    Recent pull requests
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Latest activity across your connected repositories
                  </p>
                </div>
                <GitPullRequest className="mt-1 h-5 w-5 shrink-0 text-slate-600" />
              </div>
              <div className="space-y-2">
                {(dashboard.recentPullRequests ?? []).length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-800 py-10 text-center text-sm text-slate-500">
                    No pull requests yet.
                  </p>
                ) : (
                  (dashboard.recentPullRequests ?? []).map((pr) => (
                    <div
                      key={pr.id}
                      className="flex min-w-0 flex-col gap-3 rounded-xl border border-slate-800/70 bg-slate-950/40 p-4 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-200">
                          {pr.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {pr.repoFullName}{" "}
                          <span className="px-1 text-slate-700">/</span> #
                          {pr.prNumber} by {pr.authorLogin ?? "unknown"}
                        </p>
                      </div>
                      <div className="flex min-w-0 flex-wrap items-center gap-3 lg:shrink-0 lg:justify-end">
                        <StatusPill status={pr.status} />
                        <span className="text-xs text-slate-600">
                          {formatDate(pr.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="min-w-0 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-6">
              <div className="mb-5 flex min-w-0 items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-white">
                    Repository health
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Sync status from your latest runs
                  </p>
                </div>
                <Activity className="mt-1 h-5 w-5 shrink-0 text-slate-600" />
              </div>
              <div className="space-y-3">
                {health.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-800 py-10 text-center text-sm text-slate-500">
                    No repositories synced yet.
                  </p>
                ) : (
                  health.map((repo) => (
                    <div
                      key={repo.id}
                      className="flex min-w-0 flex-col items-start justify-between gap-2 border-b border-slate-800/60 pb-3 last:border-0 last:pb-0 md:flex-row md:items-center md:gap-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm text-slate-200">
                          {repo.repoFullName}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-600">
                          {repo.chunkCount ?? 0} code chunks
                        </p>
                      </div>
                      <StatusPill status={repo.status} />
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <section className="mt-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 sm:p-6">
            <div className="mb-5 flex min-w-0 items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-white">Latest reviews</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Issues identified in completed reviews
                </p>
              </div>
              <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-slate-600" />
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {(dashboard.recentReviews ?? []).length === 0 ? (
                <p className="col-span-full rounded-xl border border-dashed border-slate-800 py-10 text-center text-sm text-slate-500">
                  No completed reviews yet.
                </p>
              ) : (
                (dashboard.recentReviews ?? []).map((review) => (
                  <div
                    key={review.id}
                    className="rounded-xl border border-slate-800/70 bg-slate-950/40 p-4"
                  >
                    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <p className="min-w-0 flex-1 line-clamp-2 text-sm font-medium text-slate-200">
                        {review.title}
                      </p>
                      <span className="shrink-0 text-xs text-slate-600 sm:pt-0.5">
                        {formatDate(review.reviewedAt)}
                      </span>
                    </div>
                    <p className="mt-2 truncate text-xs text-slate-500">
                      {review.repoFullName} #{review.prNumber}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                      <XCircle className="h-3.5 w-3.5 text-amber-400" />{" "}
                      {review.issues.length}{" "}
                      {review.issues.length === 1 ? "issue" : "issues"} found
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </QuietInteractiveBackdrop>
  );
};

export default Dashboard;
