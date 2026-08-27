import { useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Filter,
  ShieldAlert,
} from "lucide-react";

interface ActionableFindingsPanelProps {
  counts: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  reviews: {
    id: string;
    title: string;
    repoFullName: string;
    prNumber: number;
    issues: { severity?: string }[];
  }[];
}

const ActionableFindingsPanel = ({
  counts,
  reviews,
}: ActionableFindingsPanelProps) => {
  const [filter, setFilter] = useState("all");
  const visibleReviews =
    filter === "all"
      ? reviews
      : reviews.filter((review) =>
          review.issues.some(
            (issue) => issue.severity?.toLowerCase() === filter,
          ),
        );
  const filters = [
    { key: "all", label: "All", value: counts.total },
    { key: "critical", label: "Critical", value: counts.critical },
    { key: "high", label: "High", value: counts.high },
    { key: "medium", label: "Medium", value: counts.medium },
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40">
      <div className="border-b border-slate-800/80 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-300">
              <Filter className="size-3.5" /> Actionable findings
            </div>
            <h2 className="font-semibold text-white">
              Risk is easier to act on when it is prioritized.
            </h2>
            <p className="mt-2 max-w-lg text-xs leading-5 text-slate-500">
              Review signals are grouped by severity, giving your team a fast
              route from a noisy diff to the next best fix.
            </p>
          </div>
          <div className="hidden size-10 shrink-0 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-400/10 text-indigo-300 sm:flex">
            <ShieldAlert className="size-5" />
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              type="button"
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`rounded-lg border px-3 py-2 text-[10px] font-semibold uppercase tracking-wider transition ${filter === item.key ? "border-indigo-400/30 bg-indigo-400/10 text-indigo-200" : "border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300"}`}
            >
              {item.label}{" "}
              <span className="ml-1 text-slate-600">{item.value}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
            Matching reviews
          </p>
          <span className="text-xs text-slate-500">
            {visibleReviews.length} reviews
          </span>
        </div>
        <div className="space-y-2">
          {visibleReviews.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 py-8 text-center">
              <CheckCircle2 className="mx-auto size-5 text-emerald-400" />
              <p className="mt-2 text-xs text-slate-500">
                No findings in this severity.
              </p>
            </div>
          ) : (
            visibleReviews.map((review) => (
              <div
                key={review.id}
                className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-950/40 p-3"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-rose-400/10 text-rose-300">
                  <AlertCircle className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-slate-200">
                    {review.title}
                  </p>
                  <p className="mt-1 truncate text-[10px] text-slate-600">
                    {review.repoFullName} · PR #{review.prNumber}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-amber-300">
                  {review.issues.length} issue
                  {review.issues.length === 1 ? "" : "s"}
                </span>
                <ArrowUpRight className="size-3.5 text-slate-600" />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default ActionableFindingsPanel;
