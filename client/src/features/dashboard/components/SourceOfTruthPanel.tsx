import { useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock3,
  Database,
  RotateCw,
  XCircle,
} from "lucide-react";

interface SourceOfTruthPanelProps {
  repositories: {
    id: string;
    repoFullName: string;
    status: string;
    chunkCount?: number;
    updatedAt?: string;
  }[];
}

const SourceOfTruthPanel = ({ repositories }: SourceOfTruthPanelProps) => {
  const [selectedId, setSelectedId] = useState(repositories[0]?.id ?? "");
  const selected =
    repositories.find((repo) => repo.id === selectedId) ?? repositories[0];
  const synced = repositories.filter((repo) => repo.status === "synced").length;
  const syncing = repositories.filter(
    (repo) => repo.status === "syncing",
  ).length;
  const failed = repositories.filter((repo) => repo.status === "failed").length;
  const icon =
    selected?.status === "synced"
      ? CheckCircle2
      : selected?.status === "failed"
        ? XCircle
        : RotateCw;
  const Icon = icon;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40">
      <div className="border-b border-slate-800/80 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
              <Database className="size-3.5" /> One source of truth
            </div>
            <h2 className="font-semibold text-white">
              Repository health, at a glance.
            </h2>
            <p className="mt-2 max-w-lg text-xs leading-5 text-slate-500">
              Every sync, code chunk, and review status rolls into one
              dependable view of what your team can trust.
            </p>
          </div>
          <div className="hidden size-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300 sm:flex">
            <Activity className="size-5" />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/5 p-3">
            <p className="text-lg font-semibold text-emerald-300">{synced}</p>
            <p className="text-[9px] uppercase tracking-wider text-slate-600">
              Synced
            </p>
          </div>
          <div className="rounded-xl border border-sky-400/15 bg-sky-400/5 p-3">
            <p className="text-lg font-semibold text-sky-300">{syncing}</p>
            <p className="text-[9px] uppercase tracking-wider text-slate-600">
              Syncing
            </p>
          </div>
          <div className="rounded-xl border border-rose-400/15 bg-rose-400/5 p-3">
            <p className="text-lg font-semibold text-rose-300">{failed}</p>
            <p className="text-[9px] uppercase tracking-wider text-slate-600">
              Failed
            </p>
          </div>
        </div>
      </div>
      <div className="grid lg:grid-cols-[1fr_1fr]">
        <div className="border-b border-slate-800/80 p-4 lg:border-b-0 lg:border-r">
          <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
            Select a repository
          </p>
          <div className="space-y-1">
            {repositories.length === 0 ? (
              <p className="px-2 py-6 text-xs text-slate-500">
                No sync history available.
              </p>
            ) : (
              repositories.map((repo) => (
                <button
                  type="button"
                  key={repo.id}
                  onClick={() => setSelectedId(repo.id)}
                  className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition ${selected?.id === repo.id ? "bg-emerald-400/10 text-emerald-200" : "text-slate-400 hover:bg-slate-800/60"}`}
                >
                  <span
                    className={`size-2 rounded-full ${repo.status === "synced" ? "bg-emerald-400" : repo.status === "failed" ? "bg-rose-400" : "bg-sky-400"}`}
                  />
                  <span className="truncate text-xs font-medium">
                    {repo.repoFullName}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
        <div className="p-5 sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
            Selected health
          </p>
          {selected ? (
            <>
              <div className="mt-3 flex items-center justify-between gap-3">
                <h3 className="truncate text-lg font-semibold text-slate-100">
                  {selected.repoFullName}
                </h3>
                <Icon
                  className={`size-5 shrink-0 ${selected.status === "failed" ? "text-rose-400" : selected.status === "synced" ? "text-emerald-400" : "text-sky-400"}`}
                />
              </div>
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/70 pb-3 text-xs">
                  <span className="flex items-center gap-2 text-slate-500">
                    <Database className="size-3.5" /> Indexed code
                  </span>
                  <strong className="text-slate-200">
                    {selected.chunkCount ?? 0} chunks
                  </strong>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800/70 pb-3 text-xs">
                  <span className="flex items-center gap-2 text-slate-500">
                    <Clock3 className="size-3.5" /> Last update
                  </span>
                  <strong className="text-slate-200">
                    {selected.updatedAt
                      ? new Date(selected.updatedAt).toLocaleDateString()
                      : "Not available"}
                  </strong>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Current status</span>
                  <strong className="capitalize text-slate-200">
                    {selected.status}
                  </strong>
                </div>
              </div>
            </>
          ) : (
            <p className="mt-6 text-xs text-slate-500">
              Choose a repository to inspect its health.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default SourceOfTruthPanel;
